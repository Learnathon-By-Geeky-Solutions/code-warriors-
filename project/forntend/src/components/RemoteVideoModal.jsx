// RemoteVideoModal.jsx
import React, { useEffect, useRef } from "react";
import "./RemoteVideoModal.css";

/**
 * Shows a remote user's track in a large overlay
 * using the existing DOM node #remote-UID.
 *
 * Props:
 *  - uid: the user ID to show
 *  - onClose: callback when user closes
 */
function RemoteVideoModal({ uid, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    // STOP the track in #remote-UID => re-PLAY in modalRef
    const container = document.getElementById(`remote-${uid}`);
    if (!container) {
      console.warn("No container for remote user:", uid);
      return;
    }

    // Grab any <video> or track in there:
    // We can do a naive approach => read the first child
    const videos = container.getElementsByTagName("video");
    if (!videos.length) {
      console.warn("No <video> found in container for UID:", uid);
      return;
    }

    const videoTrack = videos[0]; 
    if (!videoTrack) {
      console.warn("No video track element found");
      return;
    }

    // 1) remove the <video> from container
    container.innerHTML = "";

    // 2) put it in modalRef
    modalRef.current.appendChild(videoTrack);

    // On unmount => move it back
    return () => {
      container.innerHTML = "";
      container.appendChild(videoTrack);
    };
  }, [uid]);

  const handleClickOverlay = () => {
    onClose();
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="remoteModalOverlay" onClick={handleClickOverlay}>
      <div className="remoteModalContainer" onClick={stopPropagation}>
        <div className="closeBtn" onClick={onClose}>X</div>
        <div className="videoArea" ref={modalRef} />
      </div>
    </div>
  );
}

export default RemoteVideoModal;
