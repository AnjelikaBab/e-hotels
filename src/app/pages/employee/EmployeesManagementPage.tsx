import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { useHotelStore } from '../../data/hotelStore';
import type { Employee } from '../../data/mockData';

export const EmployeesManagementPage: React.FC = () => {
  const { employees, hotels, upsertEmployee, deleteEmployee } = useHotelStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    ssn: '',
    role: '',
    hotelId: ''
  });
  
  const filteredEmployees = employees.filter(emp => {
    const search = searchTerm.toLowerCase();
    return (
      emp.fullName.toLowerCase().includes(search) ||
      emp.role.toLowerCase().includes(search) ||
      emp.address.toLowerCase().includes(search)
    );
  });
  
  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      fullName: employee.fullName,
      address: employee.address,
      ssn: employee.ssn,
      role: employee.role,
      hotelId: employee.hotelId
    });
    setShowFormModal(true);
  };
  
  const handleAdd = () => {
    setSelectedEmployee(null);
    setFormData({ fullName: '', address: '', ssn: '', role: '', hotelId: '' });
    setShowFormModal(true);
  };
  
  const handleSubmit = () => {
    upsertEmployee({
      id: selectedEmployee?.id,
      fullName: formData.fullName,
      address: formData.address,
      ssn: formData.ssn,
      role: formData.role,
      hotelId: formData.hotelId
    });
    setShowFormModal(false);
    setFormData({ fullName: '', address: '', ssn: '', role: '', hotelId: '' });
  };
  
  const confirmDelete = () => {
    if (selectedEmployee) {
      deleteEmployee(selectedEmployee.id);
    }
    setShowDeleteModal(false);
    setSelectedEmployee(null);
  };
  
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2">Employee Management</h1>
          <p className="text-muted-foreground">Manage hotel staff and assignments</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Hotel</th>
                  <th className="text-left py-3 px-4">Address</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => {
                  const hotel = hotels.find(h => h.id === emp.hotelId);
                  return (
                    <tr key={emp.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{emp.fullName}</td>
                      <td className="py-3 px-4">
                        <Badge variant="default">{emp.role}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{hotel?.name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{emp.address}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(emp)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedEmployee(emp); setShowDeleteModal(true); }}>
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
      
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
        size="md"
      >
        <div className="space-y-4">
          <Input label="Full Name" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
          <Input label="Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
          <Input label="SSN/SIN" value={formData.ssn} onChange={(e) => setFormData({...formData, ssn: e.target.value})} />
          <Select
            label="Role/Position"
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            options={[
              { value: '', label: 'Select Role' },
              { value: 'Employee', label: 'Employee' },
              { value: 'Hotel Manager', label: 'Hotel Manager' }
            ]}
          />
          <Select
            label="Assigned Hotel"
            value={formData.hotelId}
            onChange={(e) => setFormData({...formData, hotelId: e.target.value})}
            options={[
              { value: '', label: 'Select Hotel' },
              ...hotels.map(h => ({ value: h.id, label: h.name }))
            ]}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowFormModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={!formData.fullName || !formData.address || !formData.ssn || !formData.role || !formData.hotelId}>{selectedEmployee ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
      
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Employee" size="sm">
        <div className="space-y-4">
          <p>Are you sure you want to delete this employee?</p>
          {selectedEmployee && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-medium">{selectedEmployee.fullName}</div>
              <div className="text-sm text-muted-foreground">{selectedEmployee.role}</div>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1">Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} className="flex-1">Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
