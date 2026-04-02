import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { useHotelStore } from '../../data/hotelStore';
import type { Customer } from '../../data/mockData';

export const CustomersPage: React.FC = () => {
  const { customers, upsertCustomer, deleteCustomer } = useHotelStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    idType: 'SSN',
    idNumber: ''
  });
  
  const filteredCustomers = customers.filter(customer => {
    const search = searchTerm.toLowerCase();
    return (
      customer.fullName.toLowerCase().includes(search) ||
      customer.address.toLowerCase().includes(search) ||
      customer.idType.toLowerCase().includes(search)
    );
  });
  
  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      fullName: customer.fullName,
      address: customer.address,
      idType: customer.idType,
      idNumber: customer.idNumber
    });
    setShowFormModal(true);
  };
  
  const handleAdd = () => {
    setSelectedCustomer(null);
    setFormData({
      fullName: '',
      address: '',
      idType: 'SSN',
      idNumber: ''
    });
    setShowFormModal(true);
  };
  
  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };
  
  const handleSubmit = () => {
    upsertCustomer({
      id: selectedCustomer?.id,
      fullName: formData.fullName,
      address: formData.address,
      idType: formData.idType as Customer['idType'],
      idNumber: formData.idNumber,
      registrationDate: selectedCustomer?.registrationDate
    });
    setShowFormModal(false);
    setFormData({ fullName: '', address: '', idType: 'SSN', idNumber: '' });
    setSelectedCustomer(null);
  };
  
  const confirmDelete = () => {
    if (selectedCustomer) {
      deleteCustomer(selectedCustomer.id);
    }
    setShowDeleteModal(false);
    setSelectedCustomer(null);
  };
  
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2">Customer Management</h1>
          <p className="text-muted-foreground">
            Manage customer records and information
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Full Name</th>
                  <th className="text-left py-3 px-4">Address</th>
                  <th className="text-left py-3 px-4">ID Type</th>
                  <th className="text-left py-3 px-4">Registration Date</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map(customer => (
                    <tr key={customer.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{customer.fullName}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{customer.address}</td>
                      <td className="py-3 px-4">
                        <Badge variant="default">{customer.idType}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{customer.registrationDate}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(customer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(customer)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Add/Edit Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            placeholder="John Smith"
          />
          
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder="123 Main Street, City, State, ZIP"
          />

          <Input
            label={`${formData.idType} Number`}
            value={formData.idNumber}
            onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
            placeholder="Enter identification number"
          />
          
          <div>
            <label className="block mb-2">ID Type</label>
            <div className="space-y-2">
              {['SSN', 'SIN', "Driver's License"].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="idType"
                    value={type}
                    checked={formData.idType === type}
                    onChange={(e) => setFormData({...formData, idType: e.target.value})}
                    className="w-4 h-4"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
          
          {!selectedCustomer && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              Registration date will be set to today's date automatically.
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowFormModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={!formData.fullName || !formData.address || !formData.idNumber}>
              {selectedCustomer ? 'Update' : 'Create'} Customer
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Customer"
        size="sm"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this customer?</p>
          {selectedCustomer && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-medium mb-2">{selectedCustomer.fullName}</div>
              <div className="text-sm text-muted-foreground">{selectedCustomer.address}</div>
            </div>
          )}
          <p className="text-sm text-destructive">This action cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="flex-1">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
