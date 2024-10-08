import Modal from "react-modal";

export const setupModalStyles = () => {
  Modal.setAppElement("#app");
  Modal.defaultStyles = {
    content: {
      ...Modal.defaultStyles.content,
      minWidth: "300px",
      maxWidth: "600px",
      minHeight: "250px",
      maxHeight: "500px",
      left: "50%",
      right: "auto",
      top: "50%",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
    },
    overlay: {
      zIndex: 1000,
      ...Modal.defaultStyles.overlay,
    },
  };
};
