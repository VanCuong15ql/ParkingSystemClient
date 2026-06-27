import React from 'react';
import axios from 'axios';
import ParkingIcon from '../ParkingDnD/ParkingIcon';
import { IoAddSharp } from "react-icons/io5";
import { FaCarSide } from "react-icons/fa";
import { MdOutlinePedalBike } from "react-icons/md";
import { FaMotorcycle } from "react-icons/fa";
import { MdLocationPin } from "react-icons/md";
import ParkingIconWithInfo from '../ParkingDnD/ParkingIconWithInfo';
import { DndProvider, useDrop } from 'react-dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ParkingForm from '../Form/ParkingForm';
import ParkingMenu from '../ParkingDnD/ParkingMenu';
import ZoneMenu from '../ParkingDnD/ZoneMenu';
import NodeMenu from '../ParkingDnD/NodeMenu';
import EdgeMenu from '../ParkingDnD/EdgeMenu';
import NodeIconDraggable from '../ParkingDnD/NodeIconDraggable';
import NodeActiveMenu from '../ParkingDnD/NodeActiveMenu';
import EdgeActiveMenu from '../ParkingDnD/EdgeActiveMenu';
import ZoneVertexHandle from '../ParkingDnD/ZoneVertexHandle';
import { MdTimeline } from "react-icons/md";
import { FaRoute } from "react-icons/fa";
import { findNodeAtPoint } from '../../utils/mapUtils';


const EmptyParking = () => {
    //set form
    const [showAddForm, setShowAddForm] = React.useState(false);
    const [formData, setFormData] = React.useState({ type: "", name: "" });
    const [editingParking, setEditingParking] = React.useState(false);
    const [editFormData, setEditFormData] = React.useState(null);
    const [filter, setFilter] = React.useState("all");
    const [mapImage, setMapImage] = React.useState("/parking-map.jpg");
    const [zoom, setZoom] = React.useState(1);
    const [zones, setZones] = React.useState([]);
    const [activeTab, setActiveTab] = React.useState('parking'); // 'parking' | 'zone' | 'line' | 'edge'
    const [onMapClick, setOnMapClick] = React.useState(false);
    const [onNodePlace, setOnNodePlace] = React.useState(false);
    const [onEdgeDraw, setOnEdgeDraw] = React.useState(false);
    const [edgeFirstEndpoint, setEdgeFirstEndpoint] = React.useState(null);
    const [currentZoneVertices, setCurrentZoneVertices] = React.useState([]);
    const [nodes, setNodes] = React.useState([]);
    const [edges, setEdges] = React.useState([]);
    const [intersectionSlots, setIntersectionSlots] = React.useState([]);
    const [activeNodeMenu, setActiveNodeMenu] = React.useState(null);
    const [activeEdgeMenu, setActiveEdgeMenu] = React.useState(null);
    const [zoneVertexEdit, setZoneVertexEdit] = React.useState(null);
    const [focusedEntranceId, setFocusedEntranceId] = React.useState(null);

    const [userId, setUserId] = React.useState(localStorage.getItem('userId'));
    const [positions, setPositions] = React.useState([]);
    const urlServer = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    const queryClient = useQueryClient();
    const mapContainerRef = React.useRef(null);
    const svgRef = React.useRef(null);
    const imageRef = React.useRef(null);
    const currentZoneVerticesRef = React.useRef(currentZoneVertices);
    React.useEffect(() => {
        currentZoneVerticesRef.current = currentZoneVertices;
    }, [currentZoneVertices]);

    // Fetch user map on mount
    React.useEffect(() => {
        const fetchUserMap = async () => {
            try {
                const response = await axios.get(`${urlServer}/users/${userId}/map`);
                if (response.data.map) {
                    setMapImage(response.data.map);
                }
            } catch (error) {
                console.error('Error fetching map:', error);
                // Use default map if fetch fails
            }
        };
        if (userId) {
            fetchUserMap();
        }
    }, [userId, urlServer]);

    // Fetch zones
    const fetchZones = async () => {
        try {
            const response = await axios.get(`${urlServer}/zones?userId=${userId}`);
            setZones(response.data);
        } catch (error) {
            console.error('Error fetching zones:', error);
        }
    };

    const fetchNodes = async () => {
        try {
            const response = await axios.get(`${urlServer}/nodes?userId=${userId}`);
            setNodes(response.data);
        } catch (error) {
            console.error('Error fetching nodes:', error);
        }
    };

    const fetchEdges = async () => {
        try {
            const response = await axios.get(`${urlServer}/edges?userId=${userId}`);
            setEdges(response.data);
        } catch (error) {
            console.error('Error fetching edges:', error);
        }
    };

    const fetchFocusedEntrance = async () => {
        try {
            const response = await axios.get(`${urlServer}/users/${userId}/focused-entrance`);
            setFocusedEntranceId(response.data.focusedEntranceId || null);
        } catch (error) {
            console.error('Error fetching focused entrance:', error);
        }
    };

    const fetchIntersectionSlots = async (entranceId) => {
        try {
            let activeEntranceId = entranceId;
            if (activeEntranceId === undefined) {
                const focusRes = await axios.get(`${urlServer}/users/${userId}/focused-entrance`);
                activeEntranceId = focusRes.data.focusedEntranceId;
            }
            const params = { userId };
            if (activeEntranceId) params.focusedEntranceId = activeEntranceId;
            const response = await axios.get(`${urlServer}/nodes/intersection-slots`, { params });
            setIntersectionSlots(response.data);
        } catch (error) {
            console.error('Error fetching intersection slots:', error);
        }
    };

    const refreshLineData = () => {
        fetchNodes();
        fetchEdges();
        fetchIntersectionSlots();
    };

    React.useEffect(() => {
        if (userId) {
            fetchZones();
            fetchFocusedEntrance();
            refreshLineData();
        }
        const interval = setInterval(() => {
            if (userId) {
                fetchZones();
                refreshLineData();
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [userId]);

    React.useEffect(() => {
        if (userId && focusedEntranceId !== undefined) {
            fetchIntersectionSlots(focusedEntranceId);
        }
    }, [focusedEntranceId, userId]);

    React.useEffect(() => {
        const onNodeSaved = () => refreshLineData();
        const onEdgeSaved = () => refreshLineData();
        const onNodePlaceStart = () => {
            setOnNodePlace(true);
            setOnMapClick(false);
            setOnEdgeDraw(false);
            setEdgeFirstEndpoint(null);
        };
        const onNodePlaceFinish = () => setOnNodePlace(false);
        const onEdgeDrawStart = () => {
            setOnEdgeDraw(true);
            setOnNodePlace(false);
            setOnMapClick(false);
            setEdgeFirstEndpoint(null);
            setActiveNodeMenu(null);
            setActiveEdgeMenu(null);
        };
        const onEdgeDrawFinish = () => {
            setOnEdgeDraw(false);
            setEdgeFirstEndpoint(null);
        };

        window.addEventListener('node-saved', onNodeSaved);
        window.addEventListener('edge-saved', onEdgeSaved);
        window.addEventListener('node-place-start', onNodePlaceStart);
        window.addEventListener('node-place-finish', onNodePlaceFinish);
        window.addEventListener('edge-draw-start', onEdgeDrawStart);
        window.addEventListener('edge-draw-finish', onEdgeDrawFinish);
        return () => {
            window.removeEventListener('node-saved', onNodeSaved);
            window.removeEventListener('edge-saved', onEdgeSaved);
            window.removeEventListener('node-place-start', onNodePlaceStart);
            window.removeEventListener('node-place-finish', onNodePlaceFinish);
            window.removeEventListener('edge-draw-start', onEdgeDrawStart);
            window.removeEventListener('edge-draw-finish', onEdgeDrawFinish);
        };
    }, [userId]);

    const resolveNodeEndpoint = (nodeId) => ({ type: 'node', nodeId });

    const selectEdgeEndpoint = (endpoint) => {
        if (!edgeFirstEndpoint) {
            setEdgeFirstEndpoint(endpoint);
            window.FuiToast?.info('Đã chọn node 1 — chọn node 2');
        } else if (String(edgeFirstEndpoint.nodeId) === String(endpoint.nodeId)) {
            window.FuiToast?.warning('Không thể nối node với chính nó');
        } else {
            createEdge(edgeFirstEndpoint, endpoint);
        }
    };

    const createEdge = async (from, to) => {
        try {
            await axios.post(`${urlServer}/edges`, { userId, from, to });
            window.FuiToast?.success('Tạo đường nối thành công');
            setOnEdgeDraw(false);
            setEdgeFirstEndpoint(null);
            window.dispatchEvent(new Event('edge-draw-finish'));
            window.dispatchEvent(new Event('edge-saved'));
        } catch (error) {
            console.error('Error creating edge:', error);
            window.FuiToast?.error(error.response?.data?.message || 'Lỗi khi tạo đường nối');
        }
    };

    const handleDeleteNode = async (node) => {
        try {
            await axios.delete(`${urlServer}/nodes/${node._id}`);
            window.FuiToast?.success('Xóa node thành công');
            setActiveNodeMenu(null);
            window.dispatchEvent(new Event('node-saved'));
        } catch (error) {
            window.FuiToast?.error('Lỗi khi xóa node');
        }
    };

    const handleDeleteEdge = async (edge) => {
        try {
            await axios.delete(`${urlServer}/edges/${edge._id}`);
            window.FuiToast?.success('Xóa đường nối thành công');
            setActiveEdgeMenu(null);
            window.dispatchEvent(new Event('edge-saved'));
        } catch (error) {
            window.FuiToast?.error('Lỗi khi xóa đường nối');
        }
    };

    const handleFocusEntrance = async (node) => {
        try {
            await axios.put(`${urlServer}/users/${userId}/focused-entrance`, {
                entranceNodeId: node._id,
            });
            setFocusedEntranceId(node._id);
            setActiveNodeMenu(null);
            window.FuiToast?.success(`Đã focus cổng: ${node.name || 'Entrance'}`);
            fetchIntersectionSlots(node._id);
        } catch (error) {
            window.FuiToast?.error('Lỗi khi focus cổng');
        }
    };

    const saveZoneVertices = async (zoneId, vertices, zoneName) => {
        try {
            await axios.put(`${urlServer}/zones/${zoneId}`, { zone_name: zoneName, vertices });
            fetchZones();
            window.dispatchEvent(new Event('zone-saved'));
        } catch (error) {
            window.FuiToast?.error('Lỗi khi cập nhật zone');
        }
    };

    const getPercentCoordsFromEvent = (ev) => {
        if (!imageRef.current) return null;
        const rect = imageRef.current.getBoundingClientRect();
        return {
            x: Math.max(0, Math.min(100, ((ev.clientX - rect.left) / rect.width) * 100)),
            y: Math.max(0, Math.min(100, ((ev.clientY - rect.top) / rect.height) * 100)),
        };
    };

    const handleZoneVertexDrag = (zoneId) => (index, ev) => {
        const coords = getPercentCoordsFromEvent(ev);
        if (!coords) return;
        const updated = currentZoneVerticesRef.current.map((v, i) => (i === index ? coords : v));
        currentZoneVerticesRef.current = updated;
        updateZoneVertices(updated, zoneId);
    };

    const handleZoneVertexDragEnd = (zoneId, zoneName) => {
        const vertices = currentZoneVerticesRef.current;
        if (zoneId && vertices.length >= 3) {
            saveZoneVertices(zoneId, vertices, zoneName);
        }
    };

    const updateZoneVertices = (updated, zoneId) => {
        setCurrentZoneVertices(updated);
        window.dispatchEvent(new CustomEvent('zone-vertices-updated', {
            detail: { vertices: updated, zoneId },
        }));
    };

    const handleNodeClick = (node, e) => {
        if (onNodePlace || onMapClick) return;

        if (onEdgeDraw) {
            e.stopPropagation();
            selectEdgeEndpoint(resolveNodeEndpoint(node._id));
            return;
        }

        const rect = mapContainerRef.current?.getBoundingClientRect();
        if (!rect) return;
        setActiveEdgeMenu(null);
        setActiveNodeMenu({
            node,
            position: { x: e.clientX - rect.left + mapContainerRef.current.scrollLeft, y: e.clientY - rect.top + mapContainerRef.current.scrollTop },
        });
    };
    const mutation = useMutation({
        mutationFn: async (newParking) => {
            const response = await axios.post('http://localhost:5000/parking-spaces', newParking);
            return response.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries('parkingSpaces');
            setShowAddForm(false);
            setFormData({ type: "", name: "" });
            window.FuiToast.success('Add parking space successfully!');
        },
        onError: (error) => {
            console.error('Error adding parking space:', error);
            window.FuiToast.error('Error adding parking space!');
        }

    }
    );
    const editMutation = useMutation({
        mutationFn: async (editParking) => {
            const response = await axios.put(`${urlServer}/parking-spaces/${editParking._id}`, editParking);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries('parkingSpaces');
            setEditingParking(false);
            setEditFormData({ type: "", name: "" });
            window.FuiToast.success('Edit parking space successfully!');
        },
        onError: (error) => {
            console.error('Error editing parking space:', error);
            window.FuiToast.error('Error editing parking space!');
        }
    });
    const deleteMutation = useMutation({
        mutationFn: async (parkingSpace) => {
            const response = await axios.delete(`${urlServer}/parking-spaces/${parkingSpace._id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries('parkingSpaces');
            window.FuiToast.success('Delete parking space successfully!');
        },
        onError: (error) => {
            console.error('Error deleting parking space:', error);
            window.FuiToast.error('Error deleting parking space!');
        }
    });
    const handleSubmit = (e, formData) => {
        e.preventDefault();
        const newParking = {
            name: formData.name,
            type: formData.type,
            userId: userId,
        };
        console.log("new parking space", newParking);
        mutation.mutate(newParking);

    }
    const handleCancle = () => {
        setShowAddForm(false);
        setFormData({ type: "", name: "" });
        window.FuiToast.warning("Cancel add parking space!");
    }
    const handleCancelEdit = () => {
        setEditingParking(false);
        setEditFormData(null);
        window.FuiToast.warning("Cancel edit parking space!");
    }
    const handleDelete = () => {
        deleteMutation.mutate(editFormData);
        setEditingParking(false);
        setEditFormData(null);
    }

    const [, drop] = useDrop(() => ({
        accept: ['PARKING_ICON_WITH_INFO', 'MAP_NODE'],
        drop: (item, monitor) => {
            const sourceOffset = monitor.getSourceClientOffset();
            const itemType = monitor.getItemType();

            if (sourceOffset && mapContainerRef.current && imageRef.current && !onMapClick && !onNodePlace && !onEdgeDraw) {
                const imageRect = imageRef.current.getBoundingClientRect();

                // 1. Lấy kích thước thực tế của icon đỗ xe (trong code bạn đang set 40x40)
                const ICON_WIDTH = 40;
                const ICON_HEIGHT = 40;

                // 2. Tính tọa độ TÂM của icon (drag preview) trên màn hình
                const centerX = sourceOffset.x + (ICON_WIDTH / 2);
                const centerY = sourceOffset.y + (ICON_HEIGHT / 2);

                // Check xem tâm của icon có nằm trong ảnh không
                if (centerX < imageRect.left || centerX > imageRect.right ||
                    centerY < imageRect.top || centerY > imageRect.bottom) {
                    console.log("Drop outside image bounds, ignoring");
                    return;
                }

                // 3. Tọa độ tâm tương đối so với góc trên cùng bên trái của ảnh
                const x = centerX - imageRect.left;
                const y = centerY - imageRect.top;

                const imageWidth = imageRect.width;
                const imageHeight = imageRect.height;

                const clampedX = Math.max(0, Math.min(x, imageWidth));
                const clampedY = Math.max(0, Math.min(y, imageHeight));

                const xPercent = (clampedX / imageWidth) * 100;
                const yPercent = (clampedY / imageHeight) * 100;

                if (itemType === 'MAP_NODE') {
                    axios.post(`${urlServer}/nodes/location/${item._id}`, { x: xPercent, y: yPercent })
                        .then(() => {
                            window.FuiToast?.success('Cập nhật vị trí node thành công');
                            window.dispatchEvent(new Event('node-saved'));
                        })
                        .catch((error) => {
                            window.FuiToast?.error(error.response?.data?.message || 'Lỗi cập nhật node');
                        });
                    return;
                }

                axios.post(`${urlServer}/parking-spaces/location/${item._id}`, {
                    locationx: xPercent,
                    locationy: yPercent,
                })
                    .then(() => {
                        axios.post(`${urlServer}/zones/check-zone/${item._id}`, {
                            locationx: xPercent,
                            locationy: yPercent,
                        })
                            .then((zoneResponse) => {
                                window.FuiToast?.success(zoneResponse.data.message);
                            })
                            .catch((error) => {
                                console.error("Error checking zone:", error);
                            });
                        queryClient.invalidateQueries('parkingSpaces');
                    })
                    .catch((error) => {
                        console.error("Error updating parking space:", error);
                    });
            }
        },
    }));

    const getMapPercentCoords = (e) => {
        if (!imageRef.current) return null;
        const rect = imageRef.current.getBoundingClientRect();
        return {
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        };
    };

    // Handle map click for zone drawing or node placement
    const handleMapClick = (e) => {
        if (!imageRef.current) return;

        const coords = getMapPercentCoords(e);
        if (!coords) return;

        if (onNodePlace) {
            window.dispatchEvent(new CustomEvent('node-map-click', { detail: coords }));
            return;
        }

        if (onEdgeDraw) {
            const hitNode = findNodeAtPoint(nodes, coords.x, coords.y);
            if (!hitNode) {
                window.FuiToast?.warning('Chọn một node trên map');
                return;
            }
            selectEdgeEndpoint(resolveNodeEndpoint(hitNode._id));
            return;
        }

        if (!onMapClick) return;

        const newVertices = [...currentZoneVertices, coords];
        setCurrentZoneVertices(newVertices);
        window.dispatchEvent(new CustomEvent('zone-vertex-added', { detail: coords }));
    };

    // Listen for zone draw / vertex edit events
    React.useEffect(() => {
        const onStart = () => {
            setOnMapClick(true);
            setOnNodePlace(false);
            setZoneVertexEdit(null);
            setCurrentZoneVertices([]);
        };
        const onFinish = () => {
            setOnMapClick(false);
            setZoneVertexEdit(null);
            fetchZones();
        };
        const onVertexEditStart = (e) => {
            const detail = e.detail;
            if (!detail) return;
            setOnMapClick(false);
            setOnNodePlace(false);
            setZoneVertexEdit(detail);
            setCurrentZoneVertices(detail.vertices);
        };
        const onVertexEditFinish = () => {
            setZoneVertexEdit(null);
        };
        const onVerticesUpdated = (e) => {
            const { vertices } = e.detail || {};
            if (vertices) setCurrentZoneVertices(vertices);
        };

        window.addEventListener('zone-draw-start', onStart);
        window.addEventListener('zone-draw-finish', onFinish);
        window.addEventListener('zone-vertex-edit-start', onVertexEditStart);
        window.addEventListener('zone-vertex-edit-finish', onVertexEditFinish);
        window.addEventListener('zone-vertices-updated', onVerticesUpdated);

        return () => {
            window.removeEventListener('zone-draw-start', onStart);
            window.removeEventListener('zone-draw-finish', onFinish);
            window.removeEventListener('zone-vertex-edit-start', onVertexEditStart);
            window.removeEventListener('zone-vertex-edit-finish', onVertexEditFinish);
            window.removeEventListener('zone-vertices-updated', onVerticesUpdated);
        };
    }, [userId]);

    // Zoom handlers
    const handleZoom = (direction) => {
        const newZoom = direction === 'in' 
            ? Math.min(zoom + 0.2, 3)
            : Math.max(zoom - 0.2, 1);
        setZoom(newZoom);
    };

    // Render polygon points for SVG
    const getPolygonPoints = (vertices) => {
        if (!imageRef.current) return '';
        const width = imageRef.current.offsetWidth;
        const height = imageRef.current.offsetHeight;

        return vertices
            .map((v) => `${(v.x / 100) * width},${(v.y / 100) * height}`)
            .join(' ');
    };
    //get all parking spaces from db
    const fetchParkingSpaces = async () => {
        const response = await axios.get(`${urlServer}/parking-spaces`, {
            params: { userId: userId },
        });
        console.log("response parking spaces", response.data);
        return response.data;
    }
    const { data: dbParkingSpaces = [], isLoading, error } = useQuery({
        queryKey: ['parkingSpaces'],
        queryFn: fetchParkingSpaces,
        refetchInterval:2000,
        onSuccess: (data) => {
            console.log('Fetched parking spaces:', dbParkingSpaces);
        },
        onError: (error) => {
            console.error('Error fetching parking spaces:', error);
        },
    });
    const handleEditClick = (parkingSpace) => {
        setEditingParking(true);
        setEditFormData(parkingSpace);
        console.log("parking space to edit", parkingSpace);
    }
    const handleSubmitEdit = (e, formData) => {
        e.preventDefault();
        const editParking = {
            name: formData.name,
            type: formData.type,
            userId: userId,
            _id: editFormData._id,
        };
        console.log("edit parking space", editParking);
        editMutation.mutate(editParking);
    }
    // filter parking spaces by type
    const filteredSpaces = dbParkingSpaces?.filter(space => {
        if (filter === 'set') {
            return space.locationx !== 0 && space.locationy !== 0;
        }
        if (filter === 'unset') {
            return space.locationx === 0 && space.locationy === 0;
        }
        if (filter === 'car') {
            return space.typeParking === 'car';
        }
        if (filter === 'bike') {
            return space.typeParking === 'bike';
        }
        if (filter === 'motor') {
            return space.typeParking === 'motor';
        }
        return true;
    });

    // Visibility threshold for parking slots based on zoom
    const PARKING_SLOT_MIN_ZOOM = 1.3;

    // Handle wheel zoom
    const handleWheel = (e) => {
        e.preventDefault();
        const newZoom = e.deltaY > 0 
            ? Math.max(zoom - 0.2, 1)
            : Math.min(zoom + 0.2, 3);
        setZoom(newZoom);
    };

    return (
        <div className='container' style={{ marginLeft: "10px", display: "flex", flexDirection: "column", height: "100vh", width: "100%", boxSizing: "border-box" }}>
            {/* Main Content */}
            <div style={{ display: "flex", flexDirection: "row", flex: 1, gap: "10px" }}>
                {/* Map Section */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                    {/* Map Container */}
                    <div ref={mapContainerRef} onWheel={handleWheel} style={{
                        position: "relative",
                        flex: 1,
                        overflow: "auto",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        minHeight: 0,
                        minWidth: 0
                    }}>
                        <div 
                            ref={drop} 
                            onClick={(onMapClick || onNodePlace || onEdgeDraw) ? handleMapClick : () => { setActiveNodeMenu(null); setActiveEdgeMenu(null); }}
                            style={{
                                display: "inline-block",
                                position: "relative",
                                transform: `scale(${zoom})`,
                                transformOrigin: "top left",
                                cursor: (onMapClick || onNodePlace || onEdgeDraw) ? "crosshair" : "default"
                            }}
                        >
                            <img
                                ref={imageRef}
                                src={mapImage}
                                alt="parking map"
                                style={{
                                    width: "auto",
                                    height: "auto",
                                    objectFit: "contain",
                                    display: "block"
                                }}
                            />

                            {/* SVG Overlay for Zones */}
                            <svg style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                pointerEvents: "none"
                            }}>
                                {/* Draw existing zones */}
                                {zones.map((zone) => (
                                    <g key={zone._id}>
                                        <polygon
                                            points={getPolygonPoints(zone.vertices)}
                                            fill="rgba(76, 175, 80, 0.2)"
                                            stroke="#4CAF50"
                                            strokeWidth="2"
                                        />
                                        <text
                                            x={`${(zone.vertices[0].x / 100) * 100}%`}
                                            y={`${(zone.vertices[0].y / 100) * 100}%`}
                                            fill="#4CAF50"
                                            fontSize="14"
                                            fontWeight="bold"
                                        >
                                            {zone.zone_name}
                                        </text>
                                    </g>
                                ))}

                                {/* Draw current zone being drawn */}
                                {onMapClick && currentZoneVertices.length > 0 && imageRef.current && (
                                    <g className="current-zone-group">
                                        {/* Lines between points */}
                                        {currentZoneVertices.map((vertex, index) => {
                                            if (index < currentZoneVertices.length - 1) {
                                                const x1 = (vertex.x / 100) * imageRef.current.offsetWidth;
                                                const y1 = (vertex.y / 100) * imageRef.current.offsetHeight;
                                                const x2 = (currentZoneVertices[index + 1].x / 100) * imageRef.current.offsetWidth;
                                                const y2 = (currentZoneVertices[index + 1].y / 100) * imageRef.current.offsetHeight;

                                                return (
                                                    <line
                                                        key={`line-${index}`}
                                                        x1={x1}
                                                        y1={y1}
                                                        x2={x2}
                                                        y2={y2}
                                                        stroke="#2196F3"
                                                        strokeWidth="2"
                                                    />
                                                );
                                            }
                                            return null;
                                        })}

                                        {/* Close polygon line */}
                                        {currentZoneVertices.length >= 3 && (
                                            <line
                                                x1={(currentZoneVertices[currentZoneVertices.length - 1].x / 100) * imageRef.current.offsetWidth}
                                                y1={(currentZoneVertices[currentZoneVertices.length - 1].y / 100) * imageRef.current.offsetHeight}
                                                x2={(currentZoneVertices[0].x / 100) * imageRef.current.offsetWidth}
                                                y2={(currentZoneVertices[0].y / 100) * imageRef.current.offsetHeight}
                                                stroke="#2196F3"
                                                strokeWidth="2"
                                                strokeDasharray="5,5"
                                            />
                                        )}

                                        {/* Points */}
                                        {currentZoneVertices.map((vertex, index) => (
                                            <circle
                                                key={`point-${index}`}
                                                cx={(vertex.x / 100) * imageRef.current.offsetWidth}
                                                cy={(vertex.y / 100) * imageRef.current.offsetHeight}
                                                r="5"
                                                fill="#2196F3"
                                            />
                                        ))}
                                    </g>
                                )}

                                {/* Zone being edited - highlight */}
                                {zoneVertexEdit && currentZoneVertices.length >= 3 && imageRef.current && (
                                    <polygon
                                        points={getPolygonPoints(currentZoneVertices)}
                                        fill="rgba(255, 87, 34, 0.25)"
                                        stroke="#FF5722"
                                        strokeWidth="2"
                                        strokeDasharray="6,4"
                                    />
                                )}
                            </svg>

                            {/* SVG Overlay for draggable zone vertices */}
                            <svg style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                pointerEvents: "none",
                            }}>
                                {(onMapClick || zoneVertexEdit) && currentZoneVertices.length > 0 && imageRef.current &&
                                    currentZoneVertices.map((vertex, index) => {
                                        const w = imageRef.current.offsetWidth;
                                        const h = imageRef.current.offsetHeight;
                                        const editZoneId = zoneVertexEdit?.zoneId || null;
                                        return (
                                            <ZoneVertexHandle
                                                key={`zone-vertex-${index}`}
                                                cx={(vertex.x / 100) * w}
                                                cy={(vertex.y / 100) * h}
                                                index={index}
                                                zoom={zoom}
                                                onDrag={handleZoneVertexDrag(editZoneId)}
                                                onDragEnd={() => {
                                                    if (zoneVertexEdit) {
                                                        handleZoneVertexDragEnd(zoneVertexEdit.zoneId, zoneVertexEdit.zone_name);
                                                    }
                                                }}
                                            />
                                        );
                                    })
                                }
                            </svg>

                            {/* SVG Overlay for Edges + intersection slot counts */}
                            <svg style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                pointerEvents: "none",
                            }}>
                                {imageRef.current && edges.map((edge) => {
                                    const from = edge.fromNode;
                                    const to = edge.toNode;
                                    if (!from || !to) return null;
                                    const w = imageRef.current.offsetWidth;
                                    const h = imageRef.current.offsetHeight;
                                    const x1 = (from.x / 100) * w;
                                    const y1 = (from.y / 100) * h;
                                    const x2 = (to.x / 100) * w;
                                    const y2 = (to.y / 100) * h;
                                    return (
                                        <line
                                            key={edge._id}
                                            x1={x1} y1={y1} x2={x2} y2={y2}
                                            stroke="#3F51B5"
                                            strokeWidth="6"
                                            strokeOpacity="0.35"
                                            style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (onEdgeDraw || onNodePlace || onMapClick) return;
                                                const rect = mapContainerRef.current?.getBoundingClientRect();
                                                if (!rect) return;
                                                setActiveNodeMenu(null);
                                                setActiveEdgeMenu({
                                                    edge,
                                                    position: { x: e.clientX - rect.left + mapContainerRef.current.scrollLeft, y: e.clientY - rect.top + mapContainerRef.current.scrollTop },
                                                });
                                            }}
                                        />
                                    );
                                })}
                                {imageRef.current && edges.map((edge) => {
                                    const from = edge.fromNode;
                                    const to = edge.toNode;
                                    if (!from || !to) return null;
                                    const w = imageRef.current.offsetWidth;
                                    const h = imageRef.current.offsetHeight;
                                    return (
                                        <line
                                            key={`vis-${edge._id}`}
                                            x1={(from.x / 100) * w}
                                            y1={(from.y / 100) * h}
                                            x2={(to.x / 100) * w}
                                            y2={(to.y / 100) * h}
                                            stroke="#3F51B5"
                                            strokeWidth="2"
                                            pointerEvents="none"
                                        />
                                    );
                                })}
                                {imageRef.current && intersectionSlots.map((item) => (
                                    item.directions.map((dir, idx) => {
                                        const w = imageRef.current.offsetWidth;
                                        const h = imageRef.current.offsetHeight;
                                        const midX = ((item.x + (dir.neighborX - item.x) * 0.35) / 100) * w;
                                        const midY = ((item.y + (dir.neighborY - item.y) * 0.35) / 100) * h;
                                        return (
                                            <g key={`${item.nodeId}-${idx}`} pointerEvents="none">
                                                <circle cx={midX} cy={midY} r="14" fill="#FF9800" stroke="white" strokeWidth="2" />
                                                <text x={midX} y={midY} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="11" fontWeight="bold">
                                                    {dir.availableSlots}
                                                </text>
                                            </g>
                                        );
                                    })
                                ))}
                            </svg>

                            {/* Nodes on map */}
                            {nodes.map((node) => {
                                const isFocusedEntrance =
                                    node.type === 'entrance' &&
                                    String(node._id) === String(focusedEntranceId);
                                return (
                                    <div
                                        key={node._id}
                                        style={{
                                            position: "absolute",
                                            left: `${node.x}%`,
                                            top: `${node.y}%`,
                                            transform: `translate(-50%, -50%) scale(${1 / zoom})`,
                                            transformOrigin: "center",
                                            zIndex: 15,
                                        }}
                                    >
                                        {isFocusedEntrance && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    width: '52px',
                                                    height: '52px',
                                                    borderRadius: '50%',
                                                    border: '3px solid #87CEEB',
                                                    boxShadow: '0 0 10px rgba(135, 206, 235, 0.8)',
                                                    pointerEvents: 'none',
                                                    zIndex: 0,
                                                }}
                                            />
                                        )}
                                        <NodeIconDraggable node={node} onClick={handleNodeClick} />
                                    </div>
                                );
                            })}

                            {activeNodeMenu && (
                                <NodeActiveMenu
                                    node={activeNodeMenu.node}
                                    position={activeNodeMenu.position}
                                    onEdit={(node) => {
                                        setActiveNodeMenu(null);
                                        setActiveTab('line');
                                        window.dispatchEvent(new CustomEvent('node-edit-request', { detail: node }));
                                    }}
                                    onDelete={handleDeleteNode}
                                    onFocus={handleFocusEntrance}
                                    isFocused={String(activeNodeMenu.node._id) === String(focusedEntranceId)}
                                    onClose={() => setActiveNodeMenu(null)}
                                />
                            )}

                            {activeEdgeMenu && (
                                <EdgeActiveMenu
                                    edge={activeEdgeMenu.edge}
                                    position={activeEdgeMenu.position}
                                    onDelete={handleDeleteEdge}
                                    onClose={() => setActiveEdgeMenu(null)}
                                />
                            )}

                            {/* Parking Slots - always visible */}
                            {dbParkingSpaces.filter(space => space.locationx !== 0 && space.locationy !== 0)?.map((space) => (
                                <div
                                    key={space._id}
                                    style={{
                                        position: "absolute",
                                        left: `${space.locationx}%`,
                                        top: `${space.locationy}%`,
                                        transform: `translate(-50%, -50%) scale(${1/zoom})`,
                                        transformOrigin: "center",
                                        width: "40px",
                                        height: "40px",
                                        zIndex: 10
                                    }}
                                >
                                    <ParkingIconWithInfo
                                        parkingSpace={space}
                                        onEdit={handleEditClick}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {/* task bar parking menu or zone menu */}
                    {/* Tab Bar */}
                    <div style={{
                        display: "flex",
                        gap: "0",
                        backgroundColor: "#f5f5f5",
                        borderBottom: "2px solid #ddd"
                    }}>
                        <button
                            onClick={() => setActiveTab('parking')}
                            style={{
                                flex: 1,
                                padding: "12px",
                                backgroundColor: activeTab === 'parking' ? "white" : "#f5f5f5",
                                border: "none",
                                borderBottom: activeTab === 'parking' ? "3px solid #4CAF50" : "none",
                                cursor: "pointer",
                                fontWeight: activeTab === 'parking' ? "bold" : "normal",
                                transition: "all 0.3s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px"
                            }}
                        >
                            <FaCarSide size={20} />
                            <span>Parking</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('zone')}
                            style={{
                                flex: 1,
                                padding: "12px",
                                backgroundColor: activeTab === 'zone' ? "white" : "#f5f5f5",
                                border: "none",
                                borderBottom: activeTab === 'zone' ? "3px solid #4CAF50" : "none",
                                cursor: "pointer",
                                fontWeight: activeTab === 'zone' ? "bold" : "normal",
                                transition: "all 0.3s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px"
                            }}
                        >
                            <MdLocationPin size={20} />
                            <span>Zones</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('line')}
                            style={{
                                flex: 1,
                                padding: "12px",
                                backgroundColor: activeTab === 'line' ? "white" : "#f5f5f5",
                                border: "none",
                                borderBottom: activeTab === 'line' ? "3px solid #FF5722" : "none",
                                cursor: "pointer",
                                fontWeight: activeTab === 'line' ? "bold" : "normal",
                                transition: "all 0.3s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px"
                            }}
                        >
                            <MdTimeline size={20} />
                            <span>Nodes</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('edge')}
                            style={{
                                flex: 1,
                                padding: "12px",
                                backgroundColor: activeTab === 'edge' ? "white" : "#f5f5f5",
                                border: "none",
                                borderBottom: activeTab === 'edge' ? "3px solid #3F51B5" : "none",
                                cursor: "pointer",
                                fontWeight: activeTab === 'edge' ? "bold" : "normal",
                                transition: "all 0.3s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px"
                            }}
                        >
                            <FaRoute size={18} />
                            <span>Edge</span>
                        </button>
                    </div>

                    {/* Side Menu */}
                    {activeTab === 'parking' && (
                        <ParkingMenu
                            dbParkingSpaces={dbParkingSpaces}
                            filter={filter}
                            setFilter={setFilter}
                            onAddClick={() => setShowAddForm(true)}
                            onEditClick={handleEditClick}
                            showAddForm={showAddForm}
                        />
                    )}

                    {activeTab === 'zone' && (
                        <ZoneMenu />
                    )}

                    {activeTab === 'line' && (
                        <NodeMenu />
                    )}

                    {activeTab === 'edge' && (
                        <EdgeMenu />
                    )}
                </div>
            </div>

            {/* form add parking space */}
            {showAddForm && (
                <ParkingForm
                    title={"Add Parking Space"}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancle}
                />
            )}
            {editingParking && (
                <ParkingForm
                    title={"Edit Parking Space"}
                    initialData={editFormData}
                    handleSubmit={handleSubmitEdit}
                    handleCancel={handleCancelEdit}
                    handleDelete={handleDelete}
                />
            )}
        </div>
    );
}
export default EmptyParking;