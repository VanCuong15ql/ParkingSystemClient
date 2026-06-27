import React from 'react';

const ZoneVertexHandle = ({ cx, cy, index, onDrag, onDragEnd, zoom = 1 }) => {
    const dragging = React.useRef(false);

    const handleMouseDown = (e) => {
        e.stopPropagation();
        e.preventDefault();
        dragging.current = true;

        const onMove = (ev) => {
            if (!dragging.current) return;
            onDrag(index, ev);
        };

        const onUp = () => {
            dragging.current = false;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            if (onDragEnd) onDragEnd();
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };

    return (
        <circle
            cx={cx}
            cy={cy}
            r={8 / zoom}
            fill="#FF5722"
            stroke="white"
            strokeWidth={2 / zoom}
            style={{ cursor: 'grab', pointerEvents: 'all' }}
            onMouseDown={handleMouseDown}
        />
    );
};

export default ZoneVertexHandle;
