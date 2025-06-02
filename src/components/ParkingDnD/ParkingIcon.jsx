import { useDrag } from "react-dnd";
import { FaCarSide } from "react-icons/fa";
const ParkingIcon = ({component: Component, typeset= "noset"}) => {
  const [{ isDragging }, drag] = useDrag(() => {
    const itemType = typeset === "noset" ? "NOSET" : "PARKING_ICON";

    return {
      type: itemType,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    };
  });

  return (
    <div
      ref={drag}
      style={{
        width: "64.72px",
        height: "40px",
        backgroundColor: "white",
        borderRadius: "5px",
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
        textAlign: "center",
        lineHeight: "40px",
        color: "black",
        fontSize: "24px",
        fontWeight: "bold",
        display: "flex",
        justifyContent: "center",
        alignItems:"center",
      }}
    >
      <Component/>
    </div>
  );
};

export default ParkingIcon;
