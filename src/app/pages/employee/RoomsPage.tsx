import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { useHotelStore } from '../../data/hotelStore';
import type { Room } from '../../data/mockData';

export const RoomsPage: React.FC = () => {
  const { rooms, hotels, upsertRoom, deleteRoom } = useHotelStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    hotelId: '',
    roomNumber: '',
    price: '',
    capacity: '2',
    viewType: 'No Special View',
    extendable: true,
    problems: '',
    status: 'Available',
    amenities: [] as string[]
  });
  
  const filteredRooms = rooms.filter(room => {
    const search = searchTerm.toLowerCase();
    const hotel = hotels.find(h => h.id === room.hotelId);
    return room.roomNumber.toLowerCase().includes(search) || hotel?.name.toLowerCase().includes(search);
  });
  
  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setFormData({
      hotelId: room.hotelId,
      roomNumber: room.roomNumber,
      price: room.price.toString(),
      capacity: room.capacity.toString(),
      viewType: room.viewType,
      extendable: room.extendable,
      problems: room.problems,
      status: room.status,
      amenities: room.amenities
    });
    setShowFormModal(true);
  };
  
  const handleAdd = () => {
    setSelectedRoom(null);
    setFormData({ hotelId: '', roomNumber: '', price: '', capacity: '2', viewType: 'No Special View', extendable: true, problems: '', status: 'Available', amenities: [] });
    setShowFormModal(true);
  };

  const handleSubmit = () => {
    upsertRoom({
      id: selectedRoom?.id,
      hotelId: formData.hotelId,
      roomNumber: formData.roomNumber,
      price: Number.parseInt(formData.price, 10),
      capacity: Number.parseInt(formData.capacity, 10),
      viewType: formData.viewType as Room['viewType'],
      extendable: formData.extendable,
      problems: formData.problems,
      status: formData.status as Room['status'],
      amenities: formData.amenities
    });
    setShowFormModal(false);
  };
  
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2">Room Management</h1>
          <p className="text-muted-foreground">Manage rooms and availability</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Room
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search rooms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Hotel</th>
                  <th className="text-left py-3 px-4">Room #</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Capacity</th>
                  <th className="text-left py-3 px-4">View</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map(room => {
                  const hotel = hotels.find(h => h.id === room.hotelId);
                  return (
                    <tr key={room.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm">{hotel?.name}</td>
                      <td className="py-3 px-4 font-medium">{room.roomNumber}</td>
                      <td className="py-3 px-4 font-semibold text-primary">${room.price}</td>
                      <td className="py-3 px-4">
                        <Badge variant="default">{room.capacity} guests</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{room.viewType}</td>
                      <td className="py-3 px-4">
                        <Badge variant={room.status === 'Available' ? 'success' : room.status === 'Maintenance' ? 'warning' : 'error'}>
                          {room.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(room)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedRoom(room); setShowDeleteModal(true); }}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <Modal isOpen={showFormModal} onClose={() => setShowFormModal(false)} title={selectedRoom ? 'Edit Room' : 'Add New Room'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Hotel" value={formData.hotelId} onChange={(e) => setFormData({...formData, hotelId: e.target.value})}
            options={[{ value: '', label: 'Select Hotel' }, ...hotels.map(h => ({ value: h.id, label: h.name }))]} />
          <Input label="Room Number" value={formData.roomNumber} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} />
          <Input label="Price per Night" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
          <Select label="Capacity" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})}
            options={[1,2,3,4,5,6].map(n => ({ value: n.toString(), label: `${n} Guest${n > 1 ? 's' : ''}` }))} />
          <Select label="View Type" value={formData.viewType} onChange={(e) => setFormData({...formData, viewType: e.target.value})}
            options={['Sea View', 'Mountain View', 'City View', 'Garden View', 'No Special View'].map(v => ({ value: v, label: v }))} />
          <Select label="Status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
            options={['Available', 'Occupied', 'Maintenance'].map(s => ({ value: s, label: s }))} />
          <div className="col-span-2">
            <label className="block mb-2">Extendable</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={formData.extendable} onChange={() => setFormData({...formData, extendable: true})} />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={!formData.extendable} onChange={() => setFormData({...formData, extendable: false})} />
                <span>No</span>
              </label>
            </div>
          </div>
          <Input label="Problems/Damages" value={formData.problems} onChange={(e) => setFormData({...formData, problems: e.target.value})} className="col-span-2" placeholder="Leave empty if none" />
        </div>
        <div className="flex gap-3 pt-6">
          <Button variant="outline" onClick={() => setShowFormModal(false)} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={!formData.hotelId || !formData.roomNumber || !formData.price}>{selectedRoom ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
      
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Room" size="sm">
        <div className="space-y-4">
          <p>Are you sure you want to delete this room?</p>
          {selectedRoom && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-medium">Room {selectedRoom.roomNumber}</div>
              <div className="text-sm text-muted-foreground">{hotels.find(h => h.id === selectedRoom.hotelId)?.name}</div>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1">Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (selectedRoom) {
                deleteRoom(selectedRoom.id);
              }
              setShowDeleteModal(false);
            }} className="flex-1">Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
