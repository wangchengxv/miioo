from io import BytesIO

import pytest
from fastapi import UploadFile
from starlette.datastructures import Headers

from app.services import media_storage


def test_build_managed_storage_metadata_adds_object_storage_fields(monkeypatch):
    monkeypatch.setattr(media_storage.settings, "MEDIA_STORAGE_MODE", "hybrid")
    monkeypatch.setattr(
        media_storage.settings,
        "MEDIA_OBJECT_STORAGE_BUCKET_RAW",
        "miioo-1435336579",
    )
    monkeypatch.setattr(
        media_storage.settings,
        "MEDIA_OBJECT_STORAGE_KEY_PREFIX_RAW",
        "raw",
    )
    monkeypatch.setattr(
        media_storage.settings,
        "MEDIA_PUBLIC_BASE_URL",
        "https://www.miiooai.com/media/origin",
    )
    monkeypatch.setattr(
        media_storage.settings,
        "MEDIA_CDN_BASE_URL",
        "https://www.miiooai.com/media/cdn",
    )

    metadata = media_storage.build_managed_storage_metadata(
        import_source="user_upload",
        managed_url="/uploads/creation/global/uploads/demo.png",
    )

    assert metadata["import_source"] == "user_upload"
    assert metadata["storage_mode"] == "object_storage"
    assert metadata["storage_bucket"] == "miioo-1435336579"
    assert metadata["storage_key"] == "raw/creation/global/uploads/demo.png"
    assert (
        metadata["download_url"]
        == "https://www.miiooai.com/media/origin/miioo-1435336579/raw/creation/global/uploads/demo.png"
    )
    assert (
        metadata["cdn_url"]
        == "https://www.miiooai.com/media/cdn/miioo-1435336579/raw/creation/global/uploads/demo.png"
    )


@pytest.mark.anyio
async def test_persist_uploaded_file_syncs_to_object_storage(monkeypatch, tmp_path):
    monkeypatch.setattr(media_storage.settings, "UPLOAD_DIR", str(tmp_path))
    monkeypatch.setattr(media_storage.settings, "MEDIA_STORAGE_MODE", "hybrid")

    captured: dict[str, object] = {}

    def fake_sync_managed_upload_to_object_storage(**kwargs):
        captured.update(kwargs)
        return {
            "storage_mode": "object_storage",
            "storage_bucket": "miioo-1435336579",
            "storage_key": "raw/images/test.png",
        }

    monkeypatch.setattr(
        media_storage,
        "_sync_managed_upload_to_object_storage",
        fake_sync_managed_upload_to_object_storage,
    )

    upload = UploadFile(
        file=BytesIO(b"demo-image"),
        filename="test.png",
        headers=Headers({"content-type": "image/png"}),
    )
    stored_url = await media_storage.persist_uploaded_file(
        upload,
        "images",
        fallback_extension=".png",
    )

    assert stored_url.startswith("/uploads/images/")
    assert captured["managed_url"] == stored_url
    assert captured["content"] == b"demo-image"
    assert captured["content_type"] == "image/png"
    assert media_storage.resolve_upload_path(stored_url).read_bytes() == b"demo-image"
