import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Building2, Mail, Phone, MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useHotelStore } from '../../data/hotelStore';
import type { HotelChain } from '../../data/mockData';

const splitValues = (value: string) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

export const HotelChainsPage: React.FC = () => {
  const { hotelChains, hotels, upsertHotelChain, deleteHotelChain } = useHotelStore();
  const [expandedChain, setExpandedChain] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChain, setSelectedChain] = useState<HotelChain | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    centralOffice: '',
    emails: '',
    phones: ''
  });
  
  const toggleChain = (chainId: string) => {
    setExpandedChain(expandedChain === chainId ? null : chainId);
  };

  const handleAdd = () => {
    setSelectedChain(null);
    setFormData({ name: '', centralOffice: '', emails: '', phones: '' });
    setShowFormModal(true);
  };

  const handleEdit = (chain: HotelChain) => {
    setSelectedChain(chain);
    setFormData({
      name: chain.name,
      centralOffice: chain.centralOffice,
      emails: chain.emails.join(', '),
      phones: chain.phones.join(', ')
    });
    setShowFormModal(true);
  };

  const handleSubmit = () => {
    upsertHotelChain({
      id: selectedChain?.id,
      name: formData.name,
      centralOffice: formData.centralOffice,
      emails: splitValues(formData.emails),
      phones: splitValues(formData.phones)
    });
    setShowFormModal(false);
  };
  
  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2">Hotel Chain Management</h1>
          <p className="text-muted-foreground">
            Overview of partner hotel chains and their properties
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Chain
        </Button>
      </div>
      
      <div className="space-y-4">
        {hotelChains.map(chain => {
          const chainHotels = hotels.filter((hotel) => hotel.chainId === chain.id);
          const isExpanded = expandedChain === chain.id;
          
          return (
            <Card key={chain.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3 mb-3">
                      <Building2 className="w-6 h-6 text-accent" />
                      {chain.name}
                    </CardTitle>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm min-w-0">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground break-words">{chain.centralOffice}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground break-words">{chain.emails.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground break-words">{chain.phones.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {chainHotels.length} Hotel{chainHotels.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleChain(chain.id)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors ml-4"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  <div className="ml-2 flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(chain)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedChain(chain); setShowDeleteModal(true); }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent>
                  <div className="border-t border-border pt-6">
                    <h4 className="mb-4">Hotels in Network</h4>
                    <div className="space-y-3">
                      {chainHotels.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No hotels registered for this chain
                        </p>
                      ) : (
                        chainHotels.map(hotel => (
                          <div key={hotel.id} className="p-4 bg-muted rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="mb-1">{hotel.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {hotel.address}, {hotel.city}, {hotel.state}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="default">
                                  {hotel.category} Star{hotel.category > 1 ? 's' : ''}
                                </Badge>
                                <Badge variant="info">
                                  {hotel.numberOfRooms} Rooms
                                </Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm mt-3 min-w-0">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground break-words">{hotel.emails.join(', ')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground break-words">{hotel.phones.join(', ')}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Modal isOpen={showFormModal} onClose={() => setShowFormModal(false)} title={selectedChain ? 'Edit Hotel Chain' : 'Add Hotel Chain'} size="lg">
        <div className="space-y-4">
          <Input label="Chain Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <Input label="Central Office Address" value={formData.centralOffice} onChange={(e) => setFormData({ ...formData, centralOffice: e.target.value })} />
          <Input label="Emails" value={formData.emails} onChange={(e) => setFormData({ ...formData, emails: e.target.value })} placeholder="contact@example.com, partners@example.com" />
          <Input label="Phones" value={formData.phones} onChange={(e) => setFormData({ ...formData, phones: e.target.value })} placeholder="+1-800-555-0101, +1-800-555-0109" />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowFormModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={!formData.name || !formData.centralOffice || splitValues(formData.emails).length === 0 || splitValues(formData.phones).length === 0}>
              {selectedChain ? 'Update' : 'Create'} Chain
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Hotel Chain" size="sm">
        <div className="space-y-4">
          <p>Are you sure you want to delete this hotel chain and its hotels from the demo data?</p>
          {selectedChain && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-medium">{selectedChain.name}</div>
              <div className="text-sm text-muted-foreground">{selectedChain.centralOffice}</div>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1">Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (selectedChain) {
                deleteHotelChain(selectedChain.id);
              }
              setShowDeleteModal(false);
            }} className="flex-1">Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
