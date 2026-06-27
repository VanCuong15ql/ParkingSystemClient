import React, { useState, useEffect, useRef } from 'react';
import './ParkingMap.css';

const ParkingMapWithZones = () => {
    const [zones, setZones] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentVertices, setCurrentVertices] = useState([]);
    const [mapImage, setMapImage] = useState(null);
    const [zoneName, setZoneName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editingZoneId, setEditingZoneId] = useState(null);
    const mapContainerRef = useRef(null);
    const svgRef = useRef(null);
    const imageRef = useRef(null);

    const userId = localStorage.getItem('userId');
    const urlServer = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

    // Fetch map and zones on mount
    useEffect(() => {
        fetchUserMap();
        fetchZones();
    }, []);

    const fetchUserMap = async () => {
        try {
            const response = await fetch(`${urlServer}/users/${userId}/map`);
            if (response.ok) {
                const data = await response.json();
                if (data.map) {
                    setMapImage(data.map);
                }
            }
        } catch (error) {
            console.error('Error fetching map:', error);
        }
    };

    const fetchZones = async () => {
        try {
            const response = await fetch(`${urlServer}/zones?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setZones(data);
            }
        } catch (error) {
            console.error('Error fetching zones:', error);
        }
    };

    const handleMapClick = (e) => {
        if (!isDrawing || !mapContainerRef.current) return;

        const rect = mapContainerRef.current.getBoundingClientRect();
        const imageRect = imageRef.current.getBoundingClientRect();

        // Get relative position within the image
        const x = ((e.clientX - imageRect.left) / imageRect.width) * 100;
        const y = ((e.clientY - imageRect.top) / imageRect.height) * 100;

        // Clamp values between 0 and 100
        const clampedX = Math.max(0, Math.min(100, x));
        const clampedY = Math.max(0, Math.min(100, y));

        setCurrentVertices([...currentVertices, { x: clampedX, y: clampedY }]);
    };

    const finishDrawing = async () => {
        if (currentVertices.length < 3) {
            if (window.FuiToast) {
                window.FuiToast.error('Zone must have at least 3 vertices');
            }
            return;
        }

        if (!zoneName.trim()) {
            if (window.FuiToast) {
                window.FuiToast.error('Please enter a zone name');
            }
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = editingZoneId 
                ? `${urlServer}/zones/${editingZoneId}`
                : `${urlServer}/zones`;
            const method = editingZoneId ? 'PUT' : 'POST';

            const payload = {
                zone_name: zoneName,
                vertices: currentVertices,
            };

            if (!editingZoneId) {
                payload.userId = userId;
            }

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                if (window.FuiToast) {
                    window.FuiToast.success(
                        editingZoneId ? 'Zone updated successfully' : 'Zone created successfully'
                    );
                }
                resetDrawing();
                fetchZones();
            } else {
                if (window.FuiToast) {
                    window.FuiToast.error('Failed to save zone');
                }
            }
        } catch (error) {
            console.error('Error saving zone:', error);
            if (window.FuiToast) {
                window.FuiToast.error('Error saving zone');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const deleteZone = async (zoneId) => {
        if (!window.confirm('Are you sure you want to delete this zone?')) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${urlServer}/zones/${zoneId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                if (window.FuiToast) {
                    window.FuiToast.success('Zone deleted successfully');
                }
                fetchZones();
            } else {
                if (window.FuiToast) {
                    window.FuiToast.error('Failed to delete zone');
                }
            }
        } catch (error) {
            console.error('Error deleting zone:', error);
            if (window.FuiToast) {
                window.FuiToast.error('Error deleting zone');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const editZone = (zone) => {
        setEditingZoneId(zone._id);
        setZoneName(zone.zone_name);
        setCurrentVertices(zone.vertices);
        setIsDrawing(true);
    };

    const resetDrawing = () => {
        setIsDrawing(false);
        setCurrentVertices([]);
        setZoneName('');
        setEditingZoneId(null);
    };

    const cancelDrawing = () => {
        resetDrawing();
    };

    const undoLastVertex = () => {
        if (currentVertices.length > 0) {
            setCurrentVertices(currentVertices.slice(0, -1));
        }
    };

    // Calculate SVG polygon points from vertices (percentage to pixel conversion)
    const getPolygonPoints = (vertices) => {
        if (!imageRef.current) return '';

        const width = imageRef.current.width;
        const height = imageRef.current.height;

        return vertices
            .map((v) => `${(v.x / 100) * width},${(v.y / 100) * height}`)
            .join(' ');
    };

    return (
        <div className="parking-map-container">
            <div className="map-header">
                <h2>Zone Management</h2>
                {!isDrawing && (
                    <button
                        className="btn-primary"
                        onClick={() => {
                            setIsDrawing(true);
                            setCurrentVertices([]);
                            setZoneName('');
                        }}
                    >
                        + Create New Zone
                    </button>
                )}
            </div>

            {isDrawing && (
                <div className="drawing-controls">
                    <div className="control-group">
                        <input
                            type="text"
                            placeholder="Enter zone name"
                            value={zoneName}
                            onChange={(e) => setZoneName(e.target.value)}
                            className="zone-name-input"
                        />
                        <button
                            className="btn-secondary"
                            onClick={undoLastVertex}
                            disabled={currentVertices.length === 0}
                        >
                            Undo Point ({currentVertices.length})
                        </button>
                    </div>
                    <div className="control-group">
                        <button
                            className="btn-success"
                            onClick={finishDrawing}
                            disabled={currentVertices.length < 3 || isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Zone'}
                        </button>
                        <button className="btn-danger" onClick={cancelDrawing}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="map-editor-section">
                <div
                    ref={mapContainerRef}
                    className="map-container"
                    onClick={isDrawing ? handleMapClick : undefined}
                    style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
                >
                    <img
                        ref={imageRef}
                        src={mapImage || 'parking-map.jpg'}
                        alt="Parking Map"
                        className="map-image"
                    />

                    <svg
                        ref={svgRef}
                        className="zone-overlay"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none',
                        }}
                    >
                        {/* Draw all existing zones */}
                        {zones.map((zone) => (
                            <g key={zone._id} className="zone-group">
                                <polygon
                                    points={getPolygonPoints(zone.vertices)}
                                    className="zone-polygon"
                                    fill="rgba(76, 175, 80, 0.2)"
                                    stroke="#4CAF50"
                                    strokeWidth="2"
                                />
                                <text
                                    x={`${(zone.vertices[0].x / 100) * imageRef.current?.width || 0}`}
                                    y={`${(zone.vertices[0].y / 100) * imageRef.current?.height || 0}`}
                                    className="zone-label"
                                    fill="#4CAF50"
                                    fontSize="14"
                                    fontWeight="bold"
                                >
                                    {zone.zone_name}
                                </text>
                            </g>
                        ))}

                        {/* Draw current drawing zone */}
                        {isDrawing && currentVertices.length > 0 && (
                            <g className="current-zone-group">
                                {/* Lines between points */}
                                {currentVertices.map((vertex, index) => {
                                    if (index < currentVertices.length - 1) {
                                        const x1 = (vertex.x / 100) * (imageRef.current?.width || 0);
                                        const y1 = (vertex.y / 100) * (imageRef.current?.height || 0);
                                        const x2 = (currentVertices[index + 1].x / 100) * (imageRef.current?.width || 0);
                                        const y2 = (currentVertices[index + 1].y / 100) * (imageRef.current?.height || 0);

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
                                {currentVertices.length >= 3 && (
                                    <line
                                        x1={(currentVertices[currentVertices.length - 1].x / 100) * (imageRef.current?.width || 0)}
                                        y1={(currentVertices[currentVertices.length - 1].y / 100) * (imageRef.current?.height || 0)}
                                        x2={(currentVertices[0].x / 100) * (imageRef.current?.width || 0)}
                                        y2={(currentVertices[0].y / 100) * (imageRef.current?.height || 0)}
                                        stroke="#2196F3"
                                        strokeWidth="2"
                                        strokeDasharray="5,5"
                                    />
                                )}

                                {/* Points */}
                                {currentVertices.map((vertex, index) => (
                                    <circle
                                        key={`point-${index}`}
                                        cx={(vertex.x / 100) * (imageRef.current?.width || 0)}
                                        cy={(vertex.y / 100) * (imageRef.current?.height || 0)}
                                        r="5"
                                        fill="#2196F3"
                                    />
                                ))}
                            </g>
                        )}
                    </svg>
                </div>

                {/* Zones List */}
                <div className="zones-list">
                    <h3>Existing Zones ({zones.length})</h3>
                    {zones.length === 0 ? (
                        <p className="no-zones">No zones created yet</p>
                    ) : (
                        <div className="zones-table">
                            {zones.map((zone) => (
                                <div key={zone._id} className="zone-item">
                                    <div className="zone-info">
                                        <h4>{zone.zone_name}</h4>
                                        <p>Vertices: {zone.vertices.length}</p>
                                    </div>
                                    <div className="zone-actions">
                                        <button
                                            className="btn-edit"
                                            onClick={() => editZone(zone)}
                                            disabled={isLoading}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => deleteZone(zone._id)}
                                            disabled={isLoading}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ParkingMapWithZones;
