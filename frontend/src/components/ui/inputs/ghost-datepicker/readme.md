# Example with useState

```tsx
const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

const isDateDisabled = (date) => {
  const startDate = new Date(data.startDate);
  startDate.setHours(0, 0, 0, 0);

  const nextDay = dateFns.add(startDate, { days: 1 });

  if (dateFns.isAfter(date, nextDay) || dateFns.isBefore(date, startDate)) {
    return true;
  }

  return false;
};

<GhostDatePicker
  date={selectedDate}
  setDate={setSelectedDate}
  calendarProps={{
    disabled: isDateDisabled,
  }}
/>;
```

# Example custom

```tsx
<GhostDatePicker
  date={startDateWatch ? dateFns.parseISO(startDateWatch) : undefined}
  setDate={(newDate) => {
    if (newDate instanceof Date) {
      form.setValue("startDate", newDate.toISOString());
    }
  }}
/>
```
