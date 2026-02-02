import { useEffect, useRef, useState } from "react";
import { useCall } from "../../context/CallContext";

const VideoCallModal = () => {
  const {
    callState,
    localStream,
    remoteStream,
    formattedDuration,
    endCall,
    toggleMute,
    toggleVideo,
  } = useCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Connect local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Connect remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleToggleMute = () => {
    const muted = toggleMute();
    setIsMuted(muted);
  };

  const handleToggleVideo = () => {
    const videoOff = toggleVideo();
    setIsVideoOff(videoOff);
  };

  const handleEndCall = () => {
    endCall();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      {/* Remote Video (Full Screen) */}
      <div className="flex-1 relative bg-gray-800">
        {callState.callType === "video" && remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-20 h-20 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <h3 className="text-white text-xl font-semibold">
                {callState.caller?.name || "Calling..."}
              </h3>
              {callState.isCalling && !callState.isInCall && (
                <p className="text-gray-400 mt-2">Ringing...</p>
              )}
              {callState.isInCall && (
                <p className="text-green-400 mt-2">{formattedDuration}</p>
              )}
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        {callState.callType === "video" && localStream && (
          <div className="absolute top-4 right-4 w-32 h-48 bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-gray-600">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                isVideoOff ? "hidden" : ""
              }`}
            />
            {isVideoOff && (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <svg
                  className="w-12 h-12 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Call Status */}
        {callState.isInCall && (
          <div className="absolute top-4 left-4 bg-black/50 px-4 py-2 rounded-full">
            <span className="text-white font-medium">{formattedDuration}</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900/90 py-6 px-4">
        <div className="flex items-center justify-center space-x-6">
          {/* Mute Button */}
          <button
            onClick={handleToggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
              isMuted
                ? "bg-red-500 text-white"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            {isMuted ? (
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            ) : (
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </button>

          {/* Video Toggle Button (only for video calls) */}
          {callState.callType === "video" && (
            <button
              onClick={handleToggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                isVideoOff
                  ? "bg-red-500 text-white"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              {isVideoOff ? (
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
