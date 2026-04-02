import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { useHotelStore } from '../../data/hotelStore';
import type { Hotel } from '../../data/mockData';

const splitValues = (value: string) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

export const HotelsPage: React.FC = () => {
  const { hotels, hotelChains, employees, upsertHotel, deleteHotel } = useHotelStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    chainId: '',
    category: '3',
    numberOfRooms: '',
    address: '',
    city: '',
    state: '',
    emails: '',
    phones: '',
    managerId: ''
  });
  
  const filteredHotels = hotels.filter(hotel => {
    const search = searchTerm.toLowerCase();
    return hotel.name.toLowerCase().includes(search) || hotel.city.toLowerCase().includes(search);
  });
  
  const handleEdit = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setFormData({
      name: hotel.name,
      chainId: hotel.chainId,
      category: hotel.category.toString(),
      numberOfRooms: hotel.numberOfRooms.toString(),
      address: hotel.address,
      city: hotel.city,
      state: hotel.state,
      emails: hotel.emails.join(', '),
      phones: hotel.phones.join(', '),
      managerId: hotel.managerId ?? ''
    });
    setShowFormModal(true);
  };
  
  const handleAdd = () => {
    setSelectedHotel(null);
    setFormData({ name: '', chainId: '', category: '3', numberOfRooms: '', address: '', city: '', state: '', emails: '', phones: '', managerId: '' });
    setShowFormModal(true);
  };

  const handleSubmit = () => {
    upsertHotel({
      id: selectedHotel?.id,
      name: formData.name,
      chainId: formData.chainId,
      category: Number.parseInt(formData.category, 10) as Hotel['category'],
      numberOfRooms: Number.parseInt(formData.numberOfRooms, 10),
      address: formData.address,
      city: formData.city,
      state: formData.state,
      emails: splitValues(formData.emails),
      phones: splitValues(formData.phones),
      managerId: formData.managerId || undefined
    });
    setShowFormModal(false);
  };
  
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2">Hotel Management</h1>
          <p className="text-muted-foreground">Manage hotels and properties</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Hotel
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search hotels..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Hotel Name</th>
                  <th className="text-left py-3 px-4">Chain</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Location</th>
                  <th className="text-left py-3 px-4">Rooms</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHotels.map(hotel => {
                  const chain = hotelChains.find(c => c.id === hotel.chainId);
                  return (
                    <tr key={hotel.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{hotel.name}</td>
                      <td className="py-3 px-4 text-sm">{chain?.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {[...Array(hotel.category)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{hotel.city}, {hotel.state}</td>
                      <td className="py-3 px-4">
                        <Badge variant="default">{hotel.numberOfRooms}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(hotel)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedHotel(hotel); setShowDeleteModal(true); }}>
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
      
      <Modal isOpen={showFormModal} onClose={() => setShowFormModal(false)} title={selectedHotel ? 'Edit Hotel' : 'Add New Hotel'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Hotel Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <Select label="Hotel Chain" value={formData.chainId} onChange={(e) => setFormData({...formData, chainId: e.target.value})}
            options={[{ value: '', label: 'Select Chain' }, ...hotelChains.map(c => ({ value: c.id, label: c.name }))]} />
          <Select label="Category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
            options={[1,2,3,4,5].map(n => ({ value: n.toString(), label: `${n} Star${n > 1 ? 's' : ''}` }))} />
          <Input label="Number of Rooms" type="number" value={formData.numberOfRooms} onChange={(e) => setFormData({...formData, numberOfRooms: e.target.value})} />
          <Input label="Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="col-span-2" />
          <Input label="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
          <Input label="State" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
          <Input label="Emails" value={formData.emails} onChange={(e) => setFormData({...formData, emails: e.target.value})} placeholder="primary@example.com, support@example.com" />
          <Input label="Phones" value={formData.phones} onChange={(e) => setFormData({...formData, phones: e.target.value})} placeholder="+1-212-555-0101, +1-212-555-0108" />
          <Select
            label="Manager Assignment"
            value={formData.managerId}
            onChange={(e) => setFormData({...formData, managerId: e.target.value})}
            options={[
              { value: '', label: 'Unassigned' },
              ...employees
                .filter((employee) => !selectedHotel || employee.hotelId === selectedHotel.id || employee.id === selectedHotel.managerId)
                .map((employee) => ({ value: employee.id, label: `${employee.fullName} - ${employee.role}` }))
            ]}
          />
        </div>
        <div className="flex gap-3 pt-6">
          <Button variant="outline" onClick={() => setShowFormModal(false)} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={!formData.name || !formData.chainId || !formData.numberOfRooms || !formData.address || !formData.city || !formData.state || splitValues(formData.emails).length === 0 || splitValues(formData.phones).length === 0}>{selectedHotel ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
      
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Hotel" size="sm">
        <div className="space-y-4">
          <p>Are you sure you want to delete this hotel?</p>
          {selectedHotel && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-medium">{selectedHotel.name}</div>
              <div className="text-sm text-muted-foreground">{selectedHotel.city}, {selectedHotel.state}</div>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1">Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (selectedHotel) {
                deleteHotel(selectedHotel.id);
              }
              setShowDeleteModal(false);
            }} className="flex-1">Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
