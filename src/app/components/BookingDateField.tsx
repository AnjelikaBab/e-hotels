import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './ui/Button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface BookingDateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabledDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
}

const today = () => {
  const now = new Date();
  const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return localMidnight;
};

export const BookingDateField: React.FC<BookingDateFieldProps> = ({
  label,
  value,
  onChange,
  disabledDates = [],
  minDate,
  maxDate
}) => {
  const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;
  const effectiveMinDate = minDate && minDate > today() ? minDate : today();

  return (
    <div>
      <label className="block mb-2 text-sm">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between font-normal">
            <span>{selectedDate ? format(selectedDate, 'PPP') : 'Select date'}</span>
            <CalendarIcon className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
            disabled={[
              { before: effectiveMinDate },
              ...(maxDate ? [{ after: maxDate }] : []),
              ...disabledDates
            ]}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
