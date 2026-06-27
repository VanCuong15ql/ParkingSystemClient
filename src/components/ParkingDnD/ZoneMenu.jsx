import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaList } from "react-icons/fa";
import axios from 'axios';
import ZoneSlotsActiveMenu from './ZoneSlotsActiveMenu';

const ZoneMenu = () => {
    const [zones, setZones] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentVertices, setCurrentVertices] = useState([]);
    const [zoneName, setZoneName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editingZoneId, setEditingZoneId] = useState(null);
    const [activeSlotsMenu, setActiveSlotsMenu] = useState(null);

    const userId = localStorage.getItem('userId');
    const urlServer = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchZones();
    }, []);

    useEffect(() => {
        const refresh = () => fetchZones();
        window.addEventListener('zone-saved', refresh);
        window.addEventListener('zone-draw-finish', refresh);
        return () => {
            window.removeEventListener('zone-saved', refresh);
            window.removeEventListener('zone-draw-finish', refresh);
        };
    }, []);

    const fetchZones = async () => {
        try {
            const response = await axios.get(`${urlServer}/zones?userId=${userId}`);
            setZones(response.data);
        } catch (error) {
            console.error('Error fetching zones:', error);
        }
    };

    const handleStartDrawing = () => {
        setIsDrawing(true);
        setCurrentVertices([]);
        setZoneName('');
        setEditingZoneId(null);
        window.dispatchEvent(new Event('zone-draw-start'));
    };

    const handleFinishDrawing = async () => {
        if (currentVertices.length < 3) {
            window.FuiToast?.error('Zone phải có ít nhất 3 đỉnh');
            return;
        }

        if (!zoneName.trim()) {
            window.FuiToast?.error('Vui lòng nhập tên zone');
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = editingZoneId
                ? `${urlServer}/zones/${editingZoneId}`
                : `${urlServer}/zones`;
            const method = editingZoneId ? 'PUT' : 'POST';

            const payload = { zone_name: zoneName, vertices: currentVertices };
            if (!editingZoneId) payload.userId = userId;

            const response = await axios({ method, url: endpoint, data: payload });

            if (response.status === 200 || response.status === 201) {
                window.FuiToast?.success(editingZoneId ? 'Cập nhật zone thành công' : 'Tạo zone thành công');
                resetDrawing();
                fetchZones();
                window.dispatchEvent(new Event('zone-draw-finish'));
                window.dispatchEvent(new Event('zone-saved'));
            }
        } catch (error) {
            console.error('Error saving zone:', error);
            window.FuiToast?.error('Lỗi khi lưu zone');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const onVertex = (e) => {
            const d = e.detail;
            if (d && isDrawing) {
                setCurrentVertices((prev) => [...prev, { x: d.x, y: d.y }]);
            }
        };
        const onVerticesUpdated = (e) => {
            const { vertices, zoneId } = e.detail || {};
            if (vertices && (!editingZoneId || editingZoneId === zoneId)) {
                setCurrentVertices(vertices);
            }
        };
        window.addEventListener('zone-vertex-added', onVertex);
        window.addEventListener('zone-vertices-updated', onVerticesUpdated);
        return () => {
            window.removeEventListener('zone-vertex-added', onVertex);
            window.removeEventListener('zone-vertices-updated', onVerticesUpdated);
        };
    }, [isDrawing, editingZoneId]);

    const handleDeleteZone = async (zoneId) => {
        if (!window.confirm('Bạn có chắc muốn xóa zone này?')) return;

        setIsLoading(true);
        try {
            await axios.delete(`${urlServer}/zones/${zoneId}`);
            window.FuiToast?.success('Xóa zone thành công');
            fetchZones();
            window.dispatchEvent(new Event('zone-saved'));
        } catch (error) {
            window.FuiToast?.error('Lỗi khi xóa zone');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditZone = (zone) => {
        setEditingZoneId(zone._id);
        setZoneName(zone.zone_name);
        setCurrentVertices(zone.vertices);
        setIsDrawing(true);
        window.dispatchEvent(new CustomEvent('zone-vertex-edit-start', {
            detail: { zoneId: zone._id, zone_name: zone.zone_name, vertices: zone.vertices },
        }));
    };

    const handleViewSlots = async (zone, e) => {
        const rect = e.currentTarget.getBoundingClientRect();

        if (activeSlotsMenu?.zone?._id === zone._id) {
            setActiveSlotsMenu(null);
            return;
        }

        setActiveSlotsMenu({
            zone,
            position: { x: rect.left - 8, y: rect.top },
            slots: [],
            isLoading: true,
        });

        try {
            const response = await axios.get(`${urlServer}/zones/${zone._id}/parking-slots`);
            setActiveSlotsMenu((prev) => {
                if (!prev || prev.zone._id !== zone._id) return prev;
                return {
                    ...prev,
                    slots: response.data.slots || [],
                    isLoading: false,
                };
            });
        } catch (error) {
            window.FuiToast?.error('Lỗi khi tải parking slots');
            setActiveSlotsMenu(null);
        }
    };

    const resetDrawing = () => {
        setIsDrawing(false);
        setCurrentVertices([]);
        setZoneName('');
        setEditingZoneId(null);
        window.dispatchEvent(new Event('zone-vertex-edit-finish'));
    };

    const undoLastVertex = () => {
        if (currentVertices.length > 0) {
            const next = currentVertices.slice(0, -1);
            setCurrentVertices(next);
            window.dispatchEvent(new CustomEvent('zone-vertices-updated', {
                detail: { vertices: next, zoneId: editingZoneId },
            }));
        }
    };

    return (
        <div style={{ marginLeft: "30px", width: "320px", boxSizing: "border-box", position: 'relative' }}>
            {activeSlotsMenu && (
                <ZoneSlotsActiveMenu
                    zone={activeSlotsMenu.zone}
                    slots={activeSlotsMenu.slots}
                    position={activeSlotsMenu.position}
                    isLoading={activeSlotsMenu.isLoading}
                    placement="left"
                    onClose={() => setActiveSlotsMenu(null)}
                />
            )}
            <span style={{ fontWeight: "bold" }}>Zone Management</span>

            {!isDrawing && (
                <button
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        padding: "8px 15px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginTop: "10px",
                        fontWeight: "500"
                    }}
                    onClick={handleStartDrawing}
                >
                    <FaPlus /> New Zone
                </button>
            )}

            {isDrawing && (
                <div style={{
                    backgroundColor: "#f9f9f9",
                    padding: "10px",
                    borderRadius: "5px",
                    marginTop: "10px",
                    border: "1px solid #ddd"
                }}>
                    <input
                        type="text"
                        placeholder="Enter zone name"
                        value={zoneName}
                        onChange={(e) => setZoneName(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "8px",
                            marginBottom: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ddd",
                            boxSizing: "border-box"
                        }}
                    />
                    <p style={{ fontSize: '11px', color: '#666', margin: '0 0 8px' }}>
                        {editingZoneId
                            ? 'Kéo thả các điểm trên map để chỉnh hình zone'
                            : 'Click map để thêm điểm, kéo thả để di chuyển điểm'}
                    </p>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                        <button
                            onClick={undoLastVertex}
                            disabled={currentVertices.length === 0 || !!editingZoneId}
                            style={{
                                flex: 1,
                                padding: "8px",
                                backgroundColor: "#2196F3",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: currentVertices.length === 0 ? "not-allowed" : "pointer"
                            }}
                        >
                            Undo ({currentVertices.length})
                        </button>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            onClick={handleFinishDrawing}
                            disabled={currentVertices.length < 3 || isLoading}
                            style={{
                                flex: 1,
                                padding: "8px",
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: currentVertices.length < 3 ? "not-allowed" : "pointer"
                            }}
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={resetDrawing}
                            style={{
                                flex: 1,
                                padding: "8px",
                                backgroundColor: "#f44336",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: "400px",
                overflowY: "auto",
                marginTop: "10px",
                padding: "10px",
                backgroundColor: "white",
                borderRadius: "5px"
            }}>
                {zones.length === 0 ? (
                    <p style={{ color: "#999", textAlign: "center", margin: "20px 0" }}>
                        No zones created
                    </p>
                ) : (
                    zones.map((zone) => (
                        <div
                            key={zone._id}
                            style={{
                                padding: "10px",
                                backgroundColor: "#f5f5f5",
                                borderRadius: "4px",
                                borderLeft: "4px solid #4CAF50",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <div>
                                <strong>{zone.zone_name}</strong>
                                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#666" }}>
                                    {zone.vertices.length} vertices
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: "6px" }}>
                                <button
                                    onClick={(e) => handleViewSlots(zone, e)}
                                    disabled={isLoading}
                                    title="Xem parking slots"
                                    style={{
                                        padding: "6px 10px",
                                        backgroundColor: "#9C27B0",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    <FaList size={12} />
                                </button>
                                <button
                                    onClick={() => handleEditZone(zone)}
                                    disabled={isLoading}
                                    style={{
                                        padding: "6px 10px",
                                        backgroundColor: "#2196F3",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    <FaEdit size={12} />
                                </button>
                                <button
                                    onClick={() => handleDeleteZone(zone._id)}
                                    disabled={isLoading}
                                    style={{
                                        padding: "6px 10px",
                                        backgroundColor: "#f44336",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    <FaTrash size={12} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ZoneMenu;
