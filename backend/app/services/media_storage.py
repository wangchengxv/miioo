import base64
import ipaddress
import logging
import mimetypes
import uuid
from pathlib import Path
from urllib.parse import unquote_to_bytes, urlparse

import httpx
from fastapi import UploadFile

from app.config import settings
from app.services.media_delivery_urls import build_object_storage_public_url
from app.services.http_client import upstream_async_client
from app.utils.url_security import validate_outbound_url


logger = logging.getLogger("app.media_storage")


_CONTENT_TYPE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
    "video/mp4": ".mp4",
    "video/quicktime": ".mov",
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
}

MEDIA_FALLBACK_EXTENSIONS = {
    "image": ".png",
    "video": ".mp4",
    "audio": ".mp3",
    "document": ".bin",
}


def get_upload_root() -> Path:
    return settings.upload_root


def _clean_string(value: str | None) -> str:
    return str(value or "").strip()


def _object_storage_write_enabled() -> bool:
    return _clean_string(getattr(settings, "MEDIA_STORAGE_MODE", "")).lower() in {
        "hybrid",
        "object_storage",
    }


def _resolve_object_storage_bucket(*, media_role: str = "raw") -> str:
    mapping = {
        "raw": _clean_string(getattr(settings, "MEDIA_OBJECT_STORAGE_BUCKET_RAW", "")),
        "preview": _clean_string(getattr(settings, "MEDIA_OBJECT_STORAGE_BUCKET_PREVIEW", "")),
        "derived": _clean_string(getattr(settings, "MEDIA_OBJECT_STORAGE_BUCKET_DERIVED", "")),
        "hls": _clean_string(getattr(settings, "MEDIA_OBJECT_STORAGE_BUCKET_HLS", "")),
        "private_download": _clean_string(
            getattr(settings, "MEDIA_OBJECT_STORAGE_BUCKET_PRIVATE_DOWNLOAD", "")
        ),
    }
    return mapping.get(media_role, "") or mapping["raw"]


def _resolve_object_storage_prefix(*, media_role: str = "raw") -> str:
    mapping = {
        "raw": _clean_string(getattr(settings, "MEDIA_OBJECT_STORAGE_KEY_PREFIX_RAW", "")),
        "preview": _clean_string(getattr(settings, "MEDIA_OBJECT_STORAGE_KEY_PREFIX_PREVIEW", "")),
        "derived": _clean_string(getattr(settings, "MEDIA_OBJECT_STORAGE_KEY_PREFIX_DERIVED", "")),
        "hls": _clean_string(getattr(settings, "MEDIA_OBJECT_STORAGE_KEY_PREFIX_HLS", "")),
        "private_download": _clean_string(
            getattr(settings, "MEDIA_OBJECT_STORAGE_KEY_PREFIX_PRIVATE_DOWNLOAD", "")
        ),
    }
    return mapping.get(media_role, "") or mapping["raw"]


def build_object_storage_copy_metadata(
    managed_url: str | None,
    *,
    media_role: str = "raw",
) -> dict:
    if not _object_storage_write_enabled():
        return {}

    managed_storage_key = resolve_managed_storage_key(managed_url)
    if not managed_storage_key:
        return {}

    bucket = _resolve_object_storage_bucket(media_role=media_role)
    if not bucket:
        return {}

    prefix = _resolve_object_storage_prefix(media_role=media_role).strip("/")
    object_key = "/".join(part for part in [prefix, managed_storage_key] if part)
    if not object_key:
        return {}

    origin_url = build_object_storage_public_url(
        bucket=bucket,
        key=object_key,
        prefer_cdn=False,
    )
    cdn_url = build_object_storage_public_url(
        bucket=bucket,
        key=object_key,
        prefer_cdn=True,
    )

    metadata = {
        "storage_mode": "object_storage",
        "storage_bucket": bucket,
        "storage_key": object_key,
        "origin_storage_key": object_key,
        "download_storage_key": object_key,
    }
    if origin_url:
        metadata["source_url"] = origin_url
        metadata["download_url"] = origin_url
    if cdn_url:
        metadata["cdn_url"] = cdn_url
    return metadata


def _build_tencent_cos_client():
    try:
        from qcloud_cos import CosConfig, CosS3Client
    except ImportError as exc:
        raise RuntimeError(
            "当前环境未安装 cos-python-sdk-v5，无法把媒体写入腾讯云 COS"
        ) from exc

    region = _clean_string(getattr(settings, "MEDIA_OBJECT_STORAGE_REGION", ""))
    secret_id = _clean_string(getattr(settings, "MEDIA_OBJECT_STORAGE_SECRET_ID", ""))
    secret_key = _clean_string(getattr(settings, "MEDIA_OBJECT_STORAGE_SECRET_KEY", ""))
    if not region or not secret_id or not secret_key:
        raise RuntimeError(
            "对象存储已开启，但 MEDIA_OBJECT_STORAGE_REGION / SECRET_ID / SECRET_KEY 不完整"
        )

    config = CosConfig(
        Region=region,
        Secret_id=secret_id,
        Secret_key=secret_key,
        Scheme="https",
    )
    return CosS3Client(config)


def _sync_managed_upload_to_object_storage(
    *,
    managed_url: str,
    content: bytes,
    content_type: str | None = None,
    media_role: str = "raw",
) -> dict:
    metadata = build_object_storage_copy_metadata(managed_url, media_role=media_role)
    if not metadata:
        return {}

    bucket = _clean_string(metadata.get("storage_bucket"))
    object_key = _clean_string(metadata.get("storage_key"))
    if not bucket or not object_key:
        return {}

    client = _build_tencent_cos_client()
    put_object_kwargs = {
        "Bucket": bucket,
        "Key": object_key,
        "Body": content,
    }
    normalized_content_type = _clean_string(content_type)
    if normalized_content_type:
        put_object_kwargs["ContentType"] = normalized_content_type

    client.put_object(**put_object_kwargs)
    logger.info(
        "synced managed upload to object storage bucket=%s key=%s",
        bucket,
        object_key,
    )
    return metadata


def normalize_upload_subdir(subdir: str) -> str:
    return subdir.strip("/").replace("\\", "/")


def build_upload_url(subdir: str, filename: str) -> str:
    normalized_subdir = normalize_upload_subdir(subdir)
    if not normalized_subdir:
        return f"/uploads/{filename}"
    return f"/uploads/{normalized_subdir}/{filename}"


def is_managed_upload_url(url: str | None) -> bool:
    return bool(url and url.startswith("/uploads/"))


def extract_managed_or_private_upload_url(url: str | None) -> str | None:
    cleaned = (url or "").strip()
    if not cleaned:
        return None
    if is_managed_upload_url(cleaned):
        return cleaned
    return _extract_private_upload_url(cleaned)


def resolve_managed_storage_key(url: str | None) -> str | None:
    managed_url = extract_managed_or_private_upload_url(url)
    if not managed_url:
        return None

    relative_path = managed_url.removeprefix("/uploads/").lstrip("/")
    return relative_path or None


def _extract_private_upload_url(url: str | None) -> str | None:
    cleaned = (url or "").strip()
    if not cleaned:
        return None
    if cleaned.startswith("/uploads/"):
        return cleaned
    if not cleaned.startswith(("http://", "https://")):
        return None

    parsed = urlparse(cleaned)
    if not parsed.path.startswith("/uploads/") or not parsed.hostname:
        return None

    normalized_host = parsed.hostname.strip().strip("[]").lower()
    if normalized_host in {"localhost", "127.0.0.1", "0.0.0.0", "::1"}:
        return parsed.path

    try:
        host_ip = ipaddress.ip_address(normalized_host)
    except ValueError:
        return None

    if host_ip.is_private or host_ip.is_loopback or host_ip.is_link_local:
        return parsed.path
    return None


def is_external_media_url(url: str | None) -> bool:
    if not url:
        return False
    cleaned = url.strip()
    if not cleaned or is_managed_upload_url(cleaned) or _extract_private_upload_url(cleaned):
        return False
    return cleaned.startswith(("http://", "https://", "data:"))


def get_media_fallback_extension(media_type: str | None) -> str:
    return MEDIA_FALLBACK_EXTENSIONS.get((media_type or "").strip().lower(), ".bin")


def build_managed_storage_metadata(
    *,
    origin_url: str | None = None,
    import_source: str,
    managed_url: str | None = None,
    extra: dict | None = None,
) -> dict:
    metadata = {
        "storage_mode": "managed_upload",
        "import_source": import_source,
    }
    if origin_url:
        metadata["origin_url"] = origin_url
    if extra:
        metadata.update(extra)
    object_storage_metadata = build_object_storage_copy_metadata(managed_url)
    if object_storage_metadata:
        metadata.update(object_storage_metadata)
    return metadata


def resolve_upload_path(url: str) -> Path:
    if not is_managed_upload_url(url):
        raise ValueError(f"不是托管上传地址: {url}")

    relative_path = url.removeprefix("/uploads/").lstrip("/")
    file_path = (get_upload_root() / relative_path).resolve()
    try:
        file_path.relative_to(get_upload_root())
    except ValueError as exc:
        raise ValueError(f"上传地址超出允许目录: {url}") from exc
    return file_path


def resolve_upload_dir(subdir: str) -> Path:
    upload_dir = (get_upload_root() / normalize_upload_subdir(subdir)).resolve()
    try:
        upload_dir.relative_to(get_upload_root())
    except ValueError as exc:
        raise ValueError(f"上传子目录超出允许目录: {subdir}") from exc
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


def delete_managed_upload(url: str | None) -> bool:
    if not is_managed_upload_url(url):
        return False

    file_path = resolve_upload_path(url)
    if not file_path.exists() or not file_path.is_file():
        return False

    file_path.unlink()

    current_dir = file_path.parent
    upload_root = get_upload_root()
    while current_dir != upload_root and current_dir.exists():
        try:
            current_dir.rmdir()
        except OSError:
            break
        current_dir = current_dir.parent

    return True


def _guess_extension(url: str, content_type: str | None, fallback: str) -> str:
    if content_type:
        normalized = content_type.split(";", 1)[0].strip().lower()
        mapped = _CONTENT_TYPE_EXTENSIONS.get(normalized)
        if mapped:
            return mapped

        guessed = mimetypes.guess_extension(normalized)
        if guessed:
            return guessed

    parsed = urlparse(url)
    suffix = Path(parsed.path).suffix.lower()
    if suffix:
        return suffix

    return fallback


def _parse_data_uri(url: str) -> tuple[bytes, str | None]:
    if not url.startswith("data:"):
        raise ValueError("不是 data URI")

    header, _, data_part = url.partition(",")
    if not _:
        raise ValueError("非法 data URI")

    metadata = header[5:]
    parts = [part for part in metadata.split(";") if part]
    content_type = parts[0].strip().lower() if parts and "/" in parts[0] else None
    is_base64 = any(part.strip().lower() == "base64" for part in parts[1:] if content_type) or (
        not content_type and any(part.strip().lower() == "base64" for part in parts)
    )

    if is_base64:
        content = base64.b64decode(data_part.strip())
    else:
        content = unquote_to_bytes(data_part)

    return content, content_type


async def persist_remote_file(
    url: str,
    subdir: str,
    *,
    fallback_extension: str = ".bin",
) -> str:
    if not url:
        return url

    managed_upload_url = extract_managed_or_private_upload_url(url)
    if managed_upload_url:
        return managed_upload_url

    upload_dir = resolve_upload_dir(subdir)
    if url.startswith("data:"):
        content, content_type = _parse_data_uri(url)
    else:
        safe_url = validate_outbound_url(url, label="远程文件地址")
        async with upstream_async_client(
            profile="media",
            timeout=120.0,
            follow_redirects=True,
        ) as client:
            response = await client.get(safe_url)
            response.raise_for_status()
            content = response.content
            content_type = response.headers.get("content-type")

    extension = _guess_extension(url, content_type, fallback_extension)
    filename = f"{uuid.uuid4().hex}{extension}"
    file_path = upload_dir / filename
    file_path.write_bytes(content)
    managed_url = build_upload_url(subdir, filename)
    if _object_storage_write_enabled():
        _sync_managed_upload_to_object_storage(
            managed_url=managed_url,
            content=content,
            content_type=content_type,
        )
    return managed_url


async def persist_if_external(
    url: str | None,
    subdir: str,
    *,
    fallback_extension: str = ".bin",
    url_label: str = "远程文件地址",
) -> str | None:
    if url is None:
        return None

    cleaned = url.strip()
    if not cleaned:
        return None
    managed_upload_url = extract_managed_or_private_upload_url(cleaned)
    if managed_upload_url:
        return managed_upload_url
    if cleaned.startswith("data:"):
        return await persist_remote_file(cleaned, subdir, fallback_extension=fallback_extension)

    safe_url = validate_outbound_url(cleaned, label=url_label)
    return await persist_remote_file(safe_url, subdir, fallback_extension=fallback_extension)


async def persist_many_if_external(
    urls: list[str] | None,
    subdir: str,
    *,
    fallback_extension: str = ".bin",
    url_label: str = "远程文件地址",
) -> list[str] | None:
    if urls is None:
        return None

    persisted_urls: list[str] = []
    for raw_url in urls:
        persisted = await persist_if_external(
            raw_url,
            subdir,
            fallback_extension=fallback_extension,
            url_label=url_label,
        )
        if persisted:
            persisted_urls.append(persisted)
    return persisted_urls


async def persist_uploaded_file(
    file: UploadFile,
    subdir: str,
    *,
    allowed_extensions: set[str] | None = None,
    allowed_content_types: set[str] | None = None,
    max_size: int | None = None,
    fallback_extension: str = ".bin",
) -> str:
    content_type = (file.content_type or "").split(";", 1)[0].strip().lower()
    if allowed_content_types is not None and content_type not in allowed_content_types:
        raise ValueError("文件类型不受支持")

    filename = file.filename or f"upload{fallback_extension}"
    extension = Path(filename).suffix.lower() or fallback_extension
    if allowed_extensions is not None and extension not in allowed_extensions:
        raise ValueError("文件扩展名不受支持")

    content = await file.read()
    if max_size is not None and len(content) > max_size:
        raise ValueError("文件大小超出限制")

    upload_dir = resolve_upload_dir(subdir)

    stored_name = f"{uuid.uuid4().hex}{extension}"
    file_path = upload_dir / stored_name
    file_path.write_bytes(content)
    managed_url = build_upload_url(subdir, stored_name)
    if _object_storage_write_enabled():
        _sync_managed_upload_to_object_storage(
            managed_url=managed_url,
            content=content,
            content_type=content_type,
        )
    return managed_url
