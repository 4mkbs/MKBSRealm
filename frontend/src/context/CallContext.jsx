import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import Peer from "simple-peer";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

const CallContext = createContext(null);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    // Return default values when not in provider
    return {
      callState: {
        isReceivingCall: false,
        isCalling: false,
        isInCall: false,
        callType: null,
        caller: null,
        callId: null,
      },
      localStream: null,
      remoteStream: null,
      callDuration: 0,
      formattedDuration: "00:00",
      localVideoRef: { current: null },
      remoteVideoRef: { current: null },
      initiateCall: () => {},
      answerCall: () => {},
      rejectCall: () => {},
      endCall: () => {},
      toggleMute: () => false,
      toggleVideo: () => false,
    };
  }
  return context;
};

export const CallProvider = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [callState, setCallState] = useState({
    isReceivingCall: false,
    isCalling: false,
    isInCall: false,
    callType: null, // 'audio' or 'video'
    caller: null,
    callId: null,
  });

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callDuration, setCallDuration] = useState(0);

  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const ringtoneRef = useRef(null);
  const callTimerRef = useRef(null);
  const incomingSignalRef = useRef(null);

  // Setup socket listeners for call events
  useEffect(() => {
    if (!socket) return;

    socket.on("incoming-call", ({ callId, callType, signal, caller }) => {
      console.log("Incoming call from:", caller.name);
      incomingSignalRef.current = signal;
      setCallState({
        isReceivingCall: true,
        isCalling: false,
        isInCall: false,
        callType,
        caller,
        callId,
      });
      // Play ringtone
      playRingtone();
    });

    socket.on("call-accepted", async ({ callId, signal, accepter }) => {
      console.log("Call accepted by:", accepter.name);
      stopRingtone();
      if (peerRef.current) {
        peerRef.current.signal(signal);
      }
      setCallState((prev) => ({
        ...prev,
        isInCall: true,
        isCalling: false,
      }));
      startCallTimer();
    });

    socket.on("call-rejected", ({ callId, reason }) => {
      console.log("Call rejected:", reason);
      stopRingtone();
      endCallCleanup();
      setCallState({
        isReceivingCall: false,
        isCalling: false,
        isInCall: false,
        callType: null,
        caller: null,
        callId: null,
      });
    });

    socket.on("call-ended", ({ callId, reason }) => {
      console.log("Call ended:", reason);
      stopRingtone();
      endCallCleanup();
      setCallState({
        isReceivingCall: false,
        isCalling: false,
        isInCall: false,
        callType: null,
        caller: null,
        callId: null,
      });
    });

    socket.on("call-missed", ({ callId }) => {
      console.log("Call missed");
      stopRingtone();
      endCallCleanup();
      setCallState({
        isReceivingCall: false,
        isCalling: false,
        isInCall: false,
        callType: null,
        caller: null,
        callId: null,
      });
    });

    socket.on("ice-candidate", ({ candidate, senderId }) => {
      if (peerRef.current) {
        peerRef.current.signal({ candidate });
      }
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("call-rejected");
      socket.off("call-ended");
      socket.off("call-missed");
      socket.off("ice-candidate");
    };
  }, [socket]);

  const playRingtone = () => {
    // Create a simple audio context for ringtone
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 440;
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;

      oscillator.start();

      ringtoneRef.current = { oscillator, audioContext };

      // Ring pattern
      const ringPattern = setInterval(() => {
        if (gainNode.gain.value > 0) {
          gainNode.gain.value = 0;
        } else {
          gainNode.gain.value = 0.3;
        }
      }, 500);

      ringtoneRef.current.interval = ringPattern;
    } catch (e) {
      console.log("Could not play ringtone");
    }
  };

  const stopRingtone = () => {
    if (ringtoneRef.current) {
      try {
        if (ringtoneRef.current.interval) {
          clearInterval(ringtoneRef.current.interval);
        }
        ringtoneRef.current.oscillator?.stop();
        ringtoneRef.current.audioContext?.close();
      } catch (e) {}
      ringtoneRef.current = null;
    }
  };

  const startCallTimer = () => {
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setCallDuration(0);
  };

  const getMediaStream = async (callType) => {
    try {
      const constraints = {
        audio: true,
        video: callType === "video" ? { facingMode: "user" } : false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Error getting media stream:", error);
      throw error;
    }
  };

  const initiateCall = useCallback(
    async (recipientId, callType) => {
      if (!socket) return;

      try {
        const stream = await getMediaStream(callType);

        setCallState({
          isReceivingCall: false,
          isCalling: true,
          isInCall: false,
          callType,
          caller: null,
          callId: null,
        });

        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream,
        });

        peer.on("signal", (signal) => {
          socket.emit("call-user", {
            recipientId,
            callType,
            signal,
          });
        });

        peer.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
        });

        peer.on("error", (err) => {
          console.error("Peer error:", err);
          endCall(recipientId);
        });

        peerRef.current = peer;

        // Set timeout for unanswered calls
        setTimeout(() => {
          if (callState.isCalling && !callState.isInCall) {
            socket.emit("call-timeout", {
              callId: callState.callId,
              recipientId,
            });
            endCallCleanup();
            setCallState({
              isReceivingCall: false,
              isCalling: false,
              isInCall: false,
              callType: null,
              caller: null,
              callId: null,
            });
          }
        }, 30000); // 30 second timeout
      } catch (error) {
        console.error("Failed to initiate call:", error);
        setCallState({
          isReceivingCall: false,
          isCalling: false,
          isInCall: false,
          callType: null,
          caller: null,
          callId: null,
        });
      }
    },
    [socket, callState]
  );

  const answerCall = useCallback(async () => {
    if (!socket || !callState.isReceivingCall) return;

    try {
      stopRingtone();
      const stream = await getMediaStream(callState.callType);

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
      });

      peer.on("signal", (signal) => {
        socket.emit("accept-call", {
          callId: callState.callId,
          signal,
          callerId: callState.caller.id,
        });
      });

      peer.on("stream", (remoteStream) => {
        setRemoteStream(remoteStream);
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
        endCall(callState.caller.id);
      });

      // Signal with the incoming offer
      if (incomingSignalRef.current) {
        peer.signal(incomingSignalRef.current);
      }

      peerRef.current = peer;

      setCallState((prev) => ({
        ...prev,
        isReceivingCall: false,
        isInCall: true,
      }));

      startCallTimer();
    } catch (error) {
      console.error("Failed to answer call:", error);
      rejectCall();
    }
  }, [socket, callState]);

  const rejectCall = useCallback(() => {
    if (!socket) return;

    stopRingtone();

    if (callState.caller) {
      socket.emit("reject-call", {
        callId: callState.callId,
        callerId: callState.caller.id,
        reason: "declined",
      });
    }

    endCallCleanup();
    setCallState({
      isReceivingCall: false,
      isCalling: false,
      isInCall: false,
      callType: null,
      caller: null,
      callId: null,
    });
  }, [socket, callState]);

  const endCall = useCallback(
    (recipientId) => {
      if (!socket) return;

      socket.emit("end-call", {
        callId: callState.callId,
        recipientId: recipientId || callState.caller?.id,
      });

      stopRingtone();
      endCallCleanup();
      setCallState({
        isReceivingCall: false,
        isCalling: false,
        isInCall: false,
        callType: null,
        caller: null,
        callId: null,
      });
    },
    [socket, callState]
  );

  const endCallCleanup = () => {
    stopCallTimer();

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }

    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    incomingSignalRef.current = null;
  };

  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled;
      }
    }
    return false;
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return !videoTrack.enabled;
      }
    }
    return false;
  }, [localStream]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const value = {
    callState,
    localStream,
    remoteStream,
    callDuration,
    formattedDuration: formatDuration(callDuration),
    localVideoRef,
    remoteVideoRef,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

export default CallContext;
