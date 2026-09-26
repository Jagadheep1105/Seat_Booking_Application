import { getDb } from './index.js';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  const db = await getDb();

  // Check if events already seeded
  const existingEvents = await db.query('SELECT COUNT(*) as count FROM events');
  if (parseInt(existingEvents.rows[0].count, 10) > 0) {
    console.log('[Seed] Database already seeded.');
    return;
  }

  console.log('[Seed] Seeding database with initial events and seat layouts...');

  // 1. Create Demo User & Admin
  const hashedUserPass = await bcrypt.hash('demo123', 10);
  const hashedAdminPass = await bcrypt.hash('admin123', 10);

  await db.query(
    `INSERT INTO users (id, name, email, password_hash, role) VALUES 
     ($1, $2, $3, $4, $5),
     ($6, $7, $8, $9, $10)
     ON CONFLICT DO NOTHING`,
    [
      'user-demo-1', 'Alex Mercer', 'alex@example.com', hashedUserPass, 'user',
      'user-admin-1', 'Sarah Jenkins (Admin)', 'admin@example.com', hashedAdminPass, 'admin'
    ]
  );

  // 2. Events & Categories
  const events = [
    {
      id: 'evt-cyberpulse-2026',
      title: 'CyberPulse Music Festival 2026',
      category: 'Music',
      date: 'October 24, 2026',
      time: '19:00 PM - 01:00 AM',
      venue_name: 'NeoArena Grand Dome',
      description: 'The world\'s premier electronic audio-visual festival featuring world-renowned DJs, immersive laser installations, and cutting-edge sound engineering.',
      image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
      categories: [
        { id: 'cat-cp-vip', name: 'VIP Frontstage', price: 4500, description: 'Front-row stage view, dedicated lounge access & complimentary drinks.', color: '#10B981' },
        { id: 'cat-cp-prem', name: 'Premium Tier 1', price: 2800, description: 'Elevated central seating with prime acoustics.', color: '#3B82F6' },
        { id: 'cat-cp-reg', name: 'Regular General', price: 1500, description: 'Standard entry with full stage visibility.', color: '#6B7280' }
      ]
    },
    {
      id: 'evt-apex-tech-2026',
      title: 'Apex AI & Computer Science Summit',
      category: 'Conference',
      date: 'November 12, 2026',
      time: '09:30 AM - 17:30 PM',
      venue_name: 'Quantum Convention Center',
      description: 'A landmark gathering of tech visionaries, AI researchers, and CSE architects exploring generative models, distributed systems, and real-time computing.',
      image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      categories: [
        { id: 'cat-at-vip', name: 'VIP Executive', price: 6000, description: 'Includes speaker meet-and-greet dinner, priority Q&A, and full conference kit.', color: '#10B981' },
        { id: 'cat-at-prem', name: 'Premium Delegate', price: 3500, description: 'Reserved front-section seating & networking lounge pass.', color: '#3B82F6' },
        { id: 'cat-at-reg', name: 'Student / Regular', price: 1800, description: 'Standard keynote & workshop access.', color: '#6B7280' }
      ]
    },
    {
      id: 'evt-derby-clash-2026',
      title: 'Championship Finals: Titans vs Cyclones',
      category: 'Sports',
      date: 'December 05, 2026',
      time: '18:00 PM - 21:30 PM',
      venue_name: 'Imperial Sports Stadium',
      description: 'The ultimate stadium showdown of the season! Watch top-tier rivals battle live for the championship trophy in an electrifying atmosphere.',
      image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      categories: [
        { id: 'cat-dc-vip', name: 'VIP Box', price: 5000, description: 'Luxury climate-controlled balcony with exclusive catering.', color: '#10B981' },
        { id: 'cat-dc-prem', name: 'Premium Sideline', price: 3000, description: 'Lower bowl seats directly next to team benches.', color: '#3B82F6' },
        { id: 'cat-dc-reg', name: 'Regular Stand', price: 1200, description: 'Standard upper seating area with great field view.', color: '#6B7280' }
      ]
    }
  ];

  for (const ev of events) {
    await db.query(
      `INSERT INTO events (id, title, category, date, time, venue_name, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [ev.id, ev.title, ev.category, ev.date, ev.time, ev.venue_name, ev.description, ev.image_url]
    );

    for (const cat of ev.categories) {
      await db.query(
        `INSERT INTO ticket_categories (id, event_id, name, price, description, color)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [cat.id, ev.id, cat.name, cat.price, cat.description, cat.color]
      );
    }

    // Generate seats layout for this event
    // Row A: VIP (10 seats)
    // Rows B, C: Premium (12 seats per row = 24 seats)
    // Rows D, E, F: Regular (14 seats per row = 42 seats)
    // Total 76 seats per event
    const rowConfigs = [
      { row: 'A', catId: ev.categories[0].id, count: 10 },
      { row: 'B', catId: ev.categories[1].id, count: 12 },
      { row: 'C', catId: ev.categories[1].id, count: 12 },
      { row: 'D', catId: ev.categories[2].id, count: 14 },
      { row: 'E', catId: ev.categories[2].id, count: 14 },
      { row: 'F', catId: ev.categories[2].id, count: 14 }
    ];

    for (const cfg of rowConfigs) {
      for (let num = 1; num <= cfg.count; num++) {
        const seatId = `seat-${ev.id}-${cfg.row}${num}`;
        await db.query(
          `INSERT INTO seats (id, event_id, category_id, row_label, seat_number, status)
           VALUES ($1, $2, $3, $4, $5, 'AVAILABLE')`,
          [seatId, ev.id, cfg.catId, cfg.row, num]
        );
      }
    }
  }

  console.log('[Seed] Seed completed successfully!');
}

if (process.argv[1]?.includes('seed')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed] Error:', err);
      process.exit(1);
    });
}

