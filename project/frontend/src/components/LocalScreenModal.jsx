import React, { useEffect, useRef } from "react";
import { getLocalScreenTrack } from "./AgoraCall";
import "./LocalScreenModal.css";

/**
 * A simple full-screen overlay that plays your local screen track inside.
 * - onClose: callback to close the modal
 */
function LocalScreenModal({ onClose }) {
  const modalVideoRef = useRef(null);

  useEffect(() => {
    const track = getLocalScreenTrack();
    if (!track) return;

    // 1) Stop track in #screen-video (if it's playing there)
    track.stop();

    // 2) Play track in our modal container
    if (modalVideoRef.current) {
      track.play(modalVideoRef.current);
    }

    // On unmount, stop track, then return it to #screen-video
    return () => {
      const oldDiv = document.getElementById("screen-video");
      if (track) {
        track.stop();
        // Re-play in the small box if screen sharing is still on
        if (oldDiv && oldDiv.style.display !== "none") {
          oldDiv.innerHTML = "";
          track.play(oldDiv);
        }
      }
    };
  }, []);

  const handleOverlayClick = (e) => {
    // if user clicked the overlay (outside the modal content), close
    onClose();
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container" onClick={stopPropagation}>
        <div className="close-button" onClick={onClose}>
          X
        </div>
        {/* Where we'll play the screen track */}
        <div className="modal-video-area" ref={modalVideoRef} />
      </div>
    </div>
  );
}

export default LocalScreenModal;
