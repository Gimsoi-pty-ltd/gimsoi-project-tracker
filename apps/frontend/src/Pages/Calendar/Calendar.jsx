import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useProjectStore } from "../../store/projectStore";
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const Calendar = () => {
  const { calendarEvents = [], addCalendarEvent } = useProjectStore((state) => state);
  const [currentDate, setCurrentDate] = useState(new Date()); // Default to today
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: "", type: "task", time: "" });

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Get events for a specific date
  const getEventsForDate = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarEvents.filter(e => e.date === dateStr);
  };

  // Handle month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const changeYear = (offset) => {
    setCurrentDate(new Date(currentYear + offset, currentMonth, 1));
  };

  const handleAddEvent = () => {
    if (selectedDate && newEvent.title) {
      let dateStr = selectedDate;
      if (selectedDate instanceof Date) {
        dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      }
      addCalendarEvent({
        title: newEvent.title,
        type: newEvent.type,
        time: newEvent.time,
        date: dateStr
      });
      setShowEventModal(false);
      setNewEvent({ title: "", type: "task", time: "" });
    }
  };

  // Create calendar grid
  const calendarDays = [];
  
  // Add previous month's days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, currentMonth: false });
  }
  
  // Add current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, currentMonth: true });
  }
  
  // Add next month's days
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({ day: i, currentMonth: false });
  }

  return (
    <div className="calendar-page bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
              {months[currentMonth]} {currentYear}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Tasks & Meetings Overview
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <button 
              onClick={goToToday}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition font-medium"
            >
              Today
            </button>

            <div className="flex gap-2">
              <button 
                onClick={goToPreviousMonth}
                className="px-3 py-2 rounded-md bg-[#002D62] hover:bg-[#001f44] text-white transition-all"
                title="Previous month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={goToNextMonth}
                className="px-3 py-2 rounded-md bg-[#002D62] hover:bg-[#001f44] text-white transition-all"
                title="Next month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => changeYear(-1)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50"
              >
                ← Year
              </button>
              <button 
                onClick={() => changeYear(1)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50"
              >
                Year →
              </button>
            </div>

            <button 
              onClick={() => { setSelectedDate(new Date()); setShowEventModal(true); }}
              className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Event
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {days.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-semibold text-gray-500 tracking-wide uppercase"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((dayObj, idx) => {
              const isCurrentMonth = dayObj.currentMonth;
              const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
              const dayEvents = isCurrentMonth ? getEventsForDate(dayObj.day) : [];
              const isToday = isCurrentMonth && dayObj.day === new Date().getDate() && 
                             currentMonth === new Date().getMonth() && 
                             currentYear === new Date().getFullYear();

              return (
                <div
                  key={idx}
                  className={`min-h-32 border-b border-r border-gray-100 p-3 relative hover:bg-blue-50 transition cursor-pointer ${
                    !isCurrentMonth ? 'bg-gray-50' : ''
                  } ${isToday ? 'bg-blue-100' : ''}`}
                  onClick={() => { setSelectedDate(date); setShowEventModal(true); }}
                >
                  <div className={`text-sm font-medium ${isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}`}>
                    {dayObj.day}
                  </div>

                  {/* Events for this day */}
                  <div className="mt-2 space-y-1">
                    {dayEvents.map((event, i) => (
                      <div
                        key={event.id}
                        className={`
                          text-xs p-1.5 rounded truncate ${
                            event.type === 'meeting' 
                              ? 'bg-purple-100 text-purple-800 border-l-2 border-purple-500'
                              : event.type === 'milestone'
                              ? 'bg-orange-100 text-orange-800 border-l-2 border-orange-500'
                              : 'bg-blue-100 text-blue-800 border-l-2 border-blue-500'
                          }
                        `}
                        title={event.title}
                      >
                        {event.time && <span className="font-semibold">{event.time}</span>}
                        <span> {event.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Upcoming Tasks</h2>
            <div className="space-y-3">
              {calendarEvents
                .filter(e => e.type === 'task')
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="flex gap-3 pb-3 border-b last:border-b-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-sm font-semibold text-blue-700 flex-shrink-0">
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-500">{event.date}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Upcoming Meetings</h2>
            <div className="space-y-3">
              {calendarEvents
                .filter(e => e.type === 'meeting')
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="flex gap-3 pb-3 border-b last:border-b-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex flex-col items-center justify-center text-xs font-semibold text-purple-700 flex-shrink-0">
                      <span>{event.time?.split(':')[0]}</span>
                      <span>{event.time?.split(':')[1]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-500">{event.participants?.length || 0} attendees</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Event</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Enter event title"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="task">Task</option>
                  <option value="meeting">Meeting</option>
                  <option value="milestone">Milestone</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time (optional)</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
