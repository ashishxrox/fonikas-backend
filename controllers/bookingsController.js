import { google } from "googleapis";
// dotenv.config();

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI,
  REFRESH_TOKEN,
  CALENDAR_ID,
} = process.env;

const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

export const getAvailability = async (req, res) => {
  try {

    console.log("ENV:", {
        CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        REFRESH_TOKEN: process.env.REFRESH_TOKEN,
        REDIRECT_URI: process.env.REDIRECT_URI,
      });
    const { date } = req.body;
    const start = new Date(`${date}T00:00:00+05:30`);
    const end = new Date(`${date}T23:59:59+05:30`);

    const result = await calendar.freebusy.query({
      requestBody: {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        timeZone: "Asia/Kolkata",
        items: [{ id: CALENDAR_ID }],
      },
    });

    const busySlots = result.data.calendars[CALENDAR_ID].busy;
    const startHour = 10;
    const endHour = 18;
    const slotDuration = 30;
    const availableSlots = [];

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += slotDuration) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, min, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

        const overlaps = busySlots.some(
          (busy) =>
            new Date(busy.start) < slotEnd &&
            new Date(busy.end) > slotStart
        );

        if (!overlaps && slotStart > new Date()) {
          availableSlots.push({
            time: slotStart.toTimeString().substring(0, 5),
          });
        }
      }
    }

    res.json({ availableSlots });
  } catch (err) {
    console.error("Availability error:", err.message);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
};

export const bookMeeting = async (req, res) => {
  try {
    const { name, email, date, time } = req.body;
    const startTime = new Date(`${date}T${time}:00+05:30`);
    const endTime = new Date(startTime.getTime() + 30 * 60000);

    const event = {
      summary: `Free Consultation with ${name}`,
      description: `Booked via website by ${email}`,
      start: { dateTime: startTime.toISOString(), timeZone: "Asia/Kolkata" },
      end: { dateTime: endTime.toISOString(), timeZone: "Asia/Kolkata" },
      attendees: [{ email }],
      conferenceData: {
        createRequest: {
          requestId: `${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
      conferenceDataVersion: 1,
    });

    res.status(200).json({
      message: "Meeting booked successfully!",
      meetLink: response.data.hangoutLink,
    });
  } catch (error) {
    console.error("Error booking meeting:", error.message);
    res.status(500).json({ error: "Failed to book meeting." });
  }
};