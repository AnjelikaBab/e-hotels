import React, { useState } from 'react';
import { Download, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useHotelStore } from '../../data/hotelStore';

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'view1' | 'view2'>('view1');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState('all');
  const { areaAvailableRoomsView, hotelCapacityView } = useHotelStore();
  
  const handleExport = () => {
    alert('Export functionality would download the data');
  };

  const filteredAreaRows = areaAvailableRoomsView.filter((row) =>
    row.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHotelRows = hotelCapacityView.filter((row) => {
    const matchesSearch =
      row.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.hotelChain.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesHotel = selectedHotelId === 'all' || row.hotelId === selectedHotelId;
    return matchesSearch && matchesHotel;
  });
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2">Business Analytics</h1>
        <p className="text-muted-foreground">
          View room availability and capacity insights across properties
        </p>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('view1')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'view1' 
                ? 'border-accent text-accent' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Available Rooms per Area
          </button>
          <button
            onClick={() => setActiveTab('view2')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'view2' 
                ? 'border-accent text-accent' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Aggregated Capacity by Hotel
          </button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {activeTab === 'view1'
                ? 'View 1: Number of Available Rooms per Area'
                : 'View 2: Aggregated Capacity of All Rooms of a Specific Hotel'}
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              {activeTab === 'view2' ? (
                <select
                  value={selectedHotelId}
                  onChange={(event) => setSelectedHotelId(event.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="all">All Hotels</option>
                  {hotelCapacityView.map((row) => (
                    <option key={row.hotelId} value={row.hotelId}>
                      {row.hotelName}
                    </option>
                  ))}
                </select>
              ) : null}
              <Button size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'view1' ? (
            <>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>View Description:</strong> Shows the number of rooms currently available in each area,
                  using active booking and renting records to exclude unavailable rooms.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Area</th>
                      <th className="text-left py-3 px-4">Hotels in Area</th>
                      <th className="text-left py-3 px-4">Available Rooms</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAreaRows.map((row) => (
                        <tr key={row.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{row.area}</td>
                          <td className="py-3 px-4">
                            <Badge variant="default">{row.hotelsInArea}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="success">{row.availableRooms}</Badge>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>View Description:</strong> Shows total aggregated capacity for each hotel based on
                  summed room capacities. Use the hotel filter to focus on one property.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Hotel</th>
                      <th className="text-left py-3 px-4">Chain</th>
                      <th className="text-left py-3 px-4">Area</th>
                      <th className="text-left py-3 px-4">Room Count</th>
                      <th className="text-left py-3 px-4">Aggregated Capacity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHotelRows.map((row) => (
                        <tr key={row.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{row.hotelName}</td>
                          <td className="py-3 px-4">
                            {row.hotelChain}
                          </td>
                          <td className="py-3 px-4">{row.area}</td>
                          <td className="py-3 px-4">
                            <Badge variant="info">{row.roomCount}</Badge>
                          </td>
                          <td className="py-3 px-4 font-semibold text-green-600">
                            {row.aggregatedCapacity}
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
    </div>
  );
};
