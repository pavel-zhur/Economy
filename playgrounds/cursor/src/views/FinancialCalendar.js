import React, { useState } from 'react';
import { 
  Card, CardContent, Typography, Box, Grid, Chip, FormControl, InputLabel, Select, MenuItem,
  Button, IconButton, Badge, Tooltip, Alert, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import { 
  ChevronLeft, ChevronRight, Today, Event, TrendingUp, TrendingDown, 
  Savings, Payment, FlagOutlined, Notifications, CalendarToday
} from '@mui/icons-material';
import { getFinancialCalendarData, getEventsByDate } from '../data/mockData';

function FinancialCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventFilter, setEventFilter] = useState('all');

  const calendarData = getFinancialCalendarData(currentDate);
  
  const eventTypes = [
    { value: 'all', label: 'Все события', color: '#666' },
    { value: 'income', label: 'Доходы', color: '#4caf50' },
    { value: 'expense', label: 'Расходы', color: '#f44336' },
    { value: 'goal', label: 'Цели', color: '#2196f3' },
    { value: 'review', label: 'Ревизии', color: '#ff9800' },
    { value: 'payment', label: 'Платежи', color: '#9c27b0' }
  ];

  const getEventIcon = (type) => {
    switch (type) {
      case 'income': return <TrendingUp />;
      case 'expense': return <TrendingDown />;
      case 'goal': return <FlagOutlined />;
      case 'review': return <Event />;
      case 'payment': return <Payment />;
      default: return <CalendarToday />;
    }
  };

  const getEventColor = (type, priority = 'normal') => {
    const colors = {
      income: priority === 'high' ? '#2e7d32' : '#4caf50',
      expense: priority === 'high' ? '#c62828' : '#f44336',
      goal: priority === 'high' ? '#1565c0' : '#2196f3',
      review: priority === 'high' ? '#ef6c00' : '#ff9800',
      payment: priority === 'high' ? '#6a1b9a' : '#9c27b0'
    };
    return colors[type] || '#666';
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Пустые ячейки для дней предыдущего месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = calendarData.events[dateStr] || [];
      const filteredEvents = eventFilter === 'all' ? dayEvents : dayEvents.filter(e => e.type === eventFilter);
      
      days.push({
        day,
        dateStr,
        events: dayEvents,
        filteredEvents,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isSelected: selectedDate === dateStr
      });
    }

    return days;
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const days = getDaysInMonth();
  const selectedEvents = selectedDate ? getEventsByDate(selectedDate) : [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Календарь финансовых событий
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Визуализация всех важных финансовых событий, планов и сроков на календаре 
        для лучшего контроля времени и планирования.
      </Typography>

      <Grid container spacing={3}>
        {/* Календарь */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              {/* Заголовок календаря */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton onClick={() => navigateMonth(-1)}>
                    <ChevronLeft />
                  </IconButton>
                  <Typography variant="h5">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </Typography>
                  <IconButton onClick={() => navigateMonth(1)}>
                    <ChevronRight />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    startIcon={<Today />}
                    onClick={goToToday}
                    size="small"
                  >
                    Сегодня
                  </Button>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Тип событий</InputLabel>
                    <Select
                      value={eventFilter}
                      label="Тип событий"
                      onChange={(e) => setEventFilter(e.target.value)}
                    >
                      {eventTypes.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box 
                              sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                backgroundColor: type.color 
                              }} 
                            />
                            {type.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Дни недели */}
              <Grid container>
                {weekDays.map(day => (
                  <Grid item xs key={day} sx={{ textAlign: 'center', pb: 1 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="bold">
                      {day}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              {/* Сетка календаря */}
              <Grid container sx={{ minHeight: 400 }}>
                {days.map((dayData, index) => (
                  <Grid 
                    item 
                    xs 
                    key={index}
                    sx={{ 
                      border: '1px solid #e0e0e0',
                      minHeight: 80,
                      cursor: dayData ? 'pointer' : 'default',
                      backgroundColor: dayData?.isToday ? 'primary.lighter' : 
                                     dayData?.isSelected ? 'action.selected' : 'transparent',
                      '&:hover': dayData ? { backgroundColor: 'action.hover' } : {}
                    }}
                    onClick={() => dayData && setSelectedDate(dayData.dateStr)}
                  >
                    {dayData && (
                      <Box sx={{ p: 0.5, height: '100%' }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: dayData.isToday ? 'bold' : 'normal',
                            color: dayData.isToday ? 'primary.main' : 'text.primary'
                          }}
                        >
                          {dayData.day}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          {dayData.filteredEvents.slice(0, 3).map((event, idx) => (
                            <Tooltip key={idx} title={event.title}>
                              <Box
                                sx={{
                                  fontSize: '10px',
                                  backgroundColor: getEventColor(event.type, event.priority),
                                  color: 'white',
                                  borderRadius: 1,
                                  px: 0.5,
                                  py: 0.25,
                                  mb: 0.25,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {event.title}
                              </Box>
                            </Tooltip>
                          ))}
                          {dayData.filteredEvents.length > 3 && (
                            <Typography variant="caption" color="text.secondary">
                              +{dayData.filteredEvents.length - 3} еще
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Боковая панель */}
        <Grid item xs={12} lg={4}>
          {/* Статистика событий */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Статистика месяца
              </Typography>
              <Grid container spacing={2}>
                {eventTypes.slice(1).map(type => {
                  const count = Object.values(calendarData.events)
                    .flat()
                    .filter(e => e.type === type.value).length;
                  return (
                    <Grid item xs={6} key={type.value}>
                      <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="h6" color={type.color}>
                          {count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {type.label}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>

          {/* События выбранного дня */}
          {selectedDate && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📅 События на {new Date(selectedDate).toLocaleDateString('ru-RU')}
                </Typography>
                {selectedEvents.length > 0 ? (
                  <List dense>
                    {selectedEvents.map((event, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Box sx={{ color: getEventColor(event.type, event.priority) }}>
                            {getEventIcon(event.type)}
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={event.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {event.description}
                              </Typography>
                              {event.amount && (
                                <Typography variant="body2" fontWeight="bold" color={event.type === 'income' ? 'success.main' : 'error.main'}>
                                  {event.type === 'income' ? '+' : '-'}{event.amount.toLocaleString('ru-RU')} ₽
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    Нет событий на этот день
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          {/* Ближайшие важные события */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🚨 Ближайшие важные события
              </Typography>
              <List dense>
                {calendarData.upcomingEvents.map((event, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Box sx={{ color: getEventColor(event.type, event.priority) }}>
                        {getEventIcon(event.type)}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={event.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {event.date} - {event.daysUntil} дней
                          </Typography>
                          {event.amount && (
                            <Typography variant="body2" fontWeight="bold">
                              {event.amount.toLocaleString('ru-RU')} ₽
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    {event.priority === 'high' && (
                      <Notifications color="warning" />
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default FinancialCalendar; 