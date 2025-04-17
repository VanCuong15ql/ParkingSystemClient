import { useDrop } from "react-dnd";
import { useState } from "react";

const ParkingMap = () => {
  const [positions, setPositions] = useState([]);

  const [, drop] = useDrop(() => ({
    accept: "PARKING_ICON",
    drop: (item, monitor) => {
      const offset = monitor.getSourceClientOffset();
      if (offset) {
        const map = document.getElementById("map").getBoundingClientRect();
        const x = offset.x - map.left;
        const y = offset.y - map.top;

        setPositions((prev) => [...prev, { x, y }]);
      }
    },
  }));

return (
  <div className="container">
    <div ref={drop} id="map" style={{ position: "relative", width: "800px", height: "500px" }}>
        <img src="/parking-map.jpg" alt="Bản đồ bãi đỗ xe" style={{ width: "100%", height: "100%" }} />
        
        {positions.map((pos, index) => (
            <div
                key={index}
                style={{
                    position: "absolute",
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    width: "40px",
                    height: "40px",
                    backgroundColor: "red",
                    borderRadius: "50%",
                    textAlign: "center",
                    lineHeight: "40px",
                    color: "white",
                    fontWeight: "bold",
                }}
            >
                🅿️
            </div>
        ))}
    </div>
  </div>
);
};

export default ParkingMap;
