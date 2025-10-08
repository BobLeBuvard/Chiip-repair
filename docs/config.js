// config.js - Base de données des prix et durées
const CONFIG = {
  prices: {
    Lite:    { chip: 20, sd: 18, setup: 5, games: 5, warranty: 10, base: 60 },
    Normale: { chip: 20, sd: 18, setup: 5, games: 5, warranty: 15, base: 60 },
    Oled:    { chip: 25, sd: 18, setup: 5, games: 5, warranty: 25, base: 80 }
  },
  
  durations: {
    chip: 60,    // 60 minutes
    sd: 0,       // 0 minutes (inclus dans le chip)
    setup: 30,   // 30 minutes
    games: 60,   // 60 minutes
    warranty: 0, // 0 minutes
    base: 30     // 30 minutes de base
  },
  
  businessHours: {
    'Jeudi': ['08:00-11:00', '16:00-18:45'],
    'Vendredi': ['08:00-20:00'],
    'Samedi': ['08:00-22:00'],
    'Dimanche': ['08:00-22:00']
  }
};

// Gestion des réservations
const RESERVATION_STORAGE = {
  getReservations: function() {
    try {
      return JSON.parse(localStorage.getItem('reservations') || '[]');
    } catch (e) {
      console.error('Erreur lecture réservations:', e);
      return [];
    }
  },
  
  saveReservation: function(reservation) {
    try {
      const reservations = this.getReservations();
      reservations.push({
        ...reservation,
        id: Date.now().toString()
      });
      localStorage.setItem('reservations', JSON.stringify(reservations));
      console.log('Réservation sauvegardée:', reservation);
      return true;
    } catch (e) {
      console.error('Erreur sauvegarde réservation:', e);
      return false;
    }
  },
  
  isTimeSlotAvailable: function(day, startTime, duration) {
    const reservations = this.getReservations();
    const endTime = this.addMinutes(startTime, duration);
    
    return !reservations.some(res => {
      if (res.day !== day) return false;
      
      const resStart = res.startTime;
      const resEnd = this.addMinutes(resStart, res.duration);
      
      // Vérifier les chevauchements
      return (startTime < resEnd && endTime > resStart);
    });
  },
  
  addMinutes: function(time, minutes) {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  },
  
  // Nouvelle fonction pour marquer les créaux réservés
  getReservedSlots: function(day) {
    const reservations = this.getReservations();
    return reservations
      .filter(res => res.day === day)
      .map(res => ({
        start: res.startTime,
        end: this.addMinutes(res.startTime, res.duration),
        duration: res.duration
      }));
  }
};