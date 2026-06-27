import React from 'react';
import { useDrag } from 'react-dnd';
import NodeIcon from './NodeIcon';

const NodeIconDraggable = ({ node, onClick }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'MAP_NODE',
        item: node,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag}
            onClick={(e) => {
                e.stopPropagation();
                onClick && onClick(node, e);
            }}
            style={{
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab',
            }}
        >
            <NodeIcon node={node} />
        </div>
    );
};

export default NodeIconDraggable;
