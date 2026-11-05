
export const SEED = {
  users: [
  {
    "id": "u1",
    "username": "culerdemo",
    "email": "demo@blaugrana.hub",
    "passwordHash": "7757b683c84d0d40c501223a0932f44de727c382c33b34b70abf9740e9379d64",
    "displayName": "Culer Demo",
    "bio": "FC Barcelona till I die. Més que un club! 🔵🔴",
    "favoritePlayer": "Lamine Yamal",
    "tier": "supporter",
    "memberSince": "2023-08-01",
    "avatarInitials": "CD"
  },
  {
    "id": "u2",
    "username": "blaugrana_fan",
    "email": "fan@blaugrana.hub",
    "passwordHash": "8ec800bb5ada1bad055f22fccb042d9fb2e4dda18fc9336f2ef38ab04dea4d02",
    "displayName": "Blaugrana Fan",
    "bio": "Camp Nou is my second home.",
    "favoritePlayer": "Pedri",
    "tier": "member",
    "memberSince": "2024-01-15",
    "avatarInitials": "BF"
  },
  {
    "id": "u3",
    "username": "freeuser",
    "email": "free@blaugrana.hub",
    "passwordHash": "a49a29f80d3c647e4ec0afa745d6b474f42c1497e069ae35ba1ccfb592a2bfe9",
    "displayName": "Free User",
    "bio": "Just exploring the site.",
    "favoritePlayer": "Gavi",
    "tier": "free",
    "memberSince": "2025-03-10",
    "avatarInitials": "FU"
  }
],
  posts: [
  {
    "id": "post1",
    "userId": "u1",
    "username": "culerdemo",
    "content": "What a performance from Lamine Yamal last night! The kid is absolutely unstoppable. Future Ballon d'Or? 🔥 #ForçaBarça",
    "tag": "Match",
    "image": null,
    "timestamp": "2026-11-04T20:30:00Z",
    "likes": ["u2", "u3"],
    "comments": ["c1", "c2"]
  },
  {
    "id": "post2",
    "userId": "u2",
    "username": "blaugrana_fan",
    "content": "Pedri's return from injury is exactly what we needed. The midfield control is completely different when he's on the pitch. Missed him so much! 💙❤️",
    "tag": "Match",
    "image": null,
    "timestamp": "2026-11-03T14:15:00Z",
    "likes": ["u1"],
    "comments": ["c3"]
  },
  {
    "id": "post3",
    "userId": "u1",
    "username": "culerdemo",
    "content": "Transfer rumor: Apparently we're in the race for a top striker this January. What positions do you think we still need to strengthen? Drop your thoughts below 👇",
    "tag": "Transfers",
    "image": null,
    "timestamp": "2026-11-02T10:00:00Z",
    "likes": ["u2"],
    "comments": []
  },
  {
    "id": "post4",
    "userId": "u2",
    "username": "blaugrana_fan",
    "content": "On this day in 1999 — Luis Figo arrived at Camp Nou. What a talent he was. Barcelona's history is just unmatched. 🏆 #Barça #History",
    "tag": "History",
    "image": null,
    "timestamp": "2026-10-31T09:00:00Z",
    "likes": ["u1", "u3"],
    "comments": []
  },
  {
    "id": "post5",
    "userId": "u3",
    "username": "freeuser",
    "content": "New fan here! Just watched my first full Barça match and I'm already hooked. The passing style is just on another level. Visca el Barça! 🔵🔴",
    "tag": "Match",
    "image": null,
    "timestamp": "2026-10-29T22:45:00Z",
    "likes": ["u1", "u2"],
    "comments": ["c4"]
  }
],
  comments: [
  { "id": "c1", "postId": "post1", "userId": "u2", "username": "blaugrana_fan", "text": "Absolutely agree! His dribbling is just outrageous for a 18-year-old.", "timestamp": "2026-11-04T21:00:00Z" },
  { "id": "c2", "postId": "post1", "userId": "u3", "username": "freeuser", "text": "He reminds me of a young Messi!", "timestamp": "2026-11-04T21:30:00Z" },
  { "id": "c3", "postId": "post2", "userId": "u1", "username": "culerdemo", "text": "The difference is night and day with Pedri in the team!", "timestamp": "2026-11-03T15:00:00Z" },
  { "id": "c4", "postId": "post5", "userId": "u1", "username": "culerdemo", "text": "Welcome to the family! Visca el Barça! 🔵🔴", "timestamp": "2026-10-29T23:00:00Z" }
],
  fixtures: [
  {
    "id": "f1",
    "homeTeam": "FC Barcelona",
    "awayTeam": "Real Madrid",
    "homeScore": null,
    "awayScore": null,
    "competition": "La Liga",
    "date": "2026-11-29T21:00:00Z",
    "venue": "Camp Nou, Barcelona",
    "status": "upcoming"
  },
  {
    "id": "f2",
    "homeTeam": "FC Barcelona",
    "awayTeam": "Bayern Munich",
    "homeScore": null,
    "awayScore": null,
    "competition": "UEFA Champions League",
    "date": "2026-11-23T21:00:00Z",
    "venue": "Camp Nou, Barcelona",
    "status": "upcoming"
  },
  {
    "id": "f3",
    "homeTeam": "Atletico Madrid",
    "awayTeam": "FC Barcelona",
    "homeScore": 1,
    "awayScore": 2,
    "competition": "La Liga",
    "date": "2026-11-02T18:30:00Z",
    "venue": "Metropolitano, Madrid",
    "status": "result"
  },
  {
    "id": "f4",
    "homeTeam": "FC Barcelona",
    "awayTeam": "Borussia Dortmund",
    "homeScore": 3,
    "awayScore": 1,
    "competition": "UEFA Champions League",
    "date": "2026-10-22T21:00:00Z",
    "venue": "Camp Nou, Barcelona",
    "status": "result"
  },
  {
    "id": "f5",
    "homeTeam": "Sevilla",
    "awayTeam": "FC Barcelona",
    "homeScore": 0,
    "awayScore": 2,
    "competition": "La Liga",
    "date": "2026-10-18T21:00:00Z",
    "venue": "Ramón Sánchez Pizjuán",
    "status": "result"
  },
  {
    "id": "f6",
    "homeTeam": "FC Barcelona",
    "awayTeam": "Valencia",
    "homeScore": null,
    "awayScore": null,
    "competition": "Copa del Rey",
    "date": "2026-12-10T20:30:00Z",
    "venue": "Camp Nou, Barcelona",
    "status": "upcoming"
  }
],
  players: [
  {
    "id": "pl1", "number": 1, "name": "Iñaki Peña", "nationality": "Spain",
    "position": "Goalkeeper", "positionShort": "GK", "age": 26,
    "emoji": "🧤",
    "stats": { "appearances": 28, "cleanSheets": 11, "rating": 7.4 }
  },
  {
    "id": "pl2", "number": 25, "name": "Wojciech Szczęsny", "nationality": "Poland",
    "position": "Goalkeeper", "positionShort": "GK", "age": 34,
    "emoji": "🧤",
    "stats": { "appearances": 12, "cleanSheets": 5, "rating": 7.2 }
  },
  {
    "id": "pl3", "number": 2, "name": "Héctor Fort", "nationality": "Spain",
    "position": "Defender", "positionShort": "DEF", "age": 19,
    "emoji": "🛡️",
    "stats": { "appearances": 22, "goals": 1, "assists": 3, "rating": 7.1 }
  },
  {
    "id": "pl4", "number": 3, "name": "Alejandro Balde", "nationality": "Spain",
    "position": "Defender", "positionShort": "DEF", "age": 21,
    "emoji": "🛡️",
    "stats": { "appearances": 30, "goals": 2, "assists": 7, "rating": 7.6 }
  },
  {
    "id": "pl5", "number": 15, "name": "Pau Cubarsí", "nationality": "Spain",
    "position": "Defender", "positionShort": "DEF", "age": 18,
    "emoji": "🛡️",
    "stats": { "appearances": 32, "goals": 2, "assists": 1, "rating": 7.8 }
  },
  {
    "id": "pl6", "number": 23, "name": "Jules Koundé", "nationality": "France",
    "position": "Defender", "positionShort": "DEF", "age": 26,
    "emoji": "🛡️",
    "stats": { "appearances": 28, "goals": 3, "assists": 5, "rating": 7.7 }
  },
  {
    "id": "pl7", "number": 4, "name": "Ronald Araújo", "nationality": "Uruguay",
    "position": "Defender", "positionShort": "DEF", "age": 25,
    "emoji": "🛡️",
    "stats": { "appearances": 20, "goals": 2, "assists": 0, "rating": 7.5 }
  },
  {
    "id": "pl8", "number": 14, "name": "João Cancelo", "nationality": "Portugal",
    "position": "Defender", "positionShort": "DEF", "age": 30,
    "emoji": "🛡️",
    "stats": { "appearances": 25, "goals": 1, "assists": 6, "rating": 7.3 }
  },
  {
    "id": "pl9", "number": 5, "name": "Inigo Martínez", "nationality": "Spain",
    "position": "Defender", "positionShort": "DEF", "age": 33,
    "emoji": "🛡️",
    "stats": { "appearances": 18, "goals": 1, "assists": 0, "rating": 7.0 }
  },
  {
    "id": "pl10", "number": 8, "name": "Pedri", "nationality": "Spain",
    "position": "Midfielder", "positionShort": "MID", "age": 22,
    "emoji": "⚡",
    "stats": { "appearances": 26, "goals": 8, "assists": 10, "rating": 8.4 }
  },
  {
    "id": "pl11", "number": 6, "name": "Gavi", "nationality": "Spain",
    "position": "Midfielder", "positionShort": "MID", "age": 20,
    "emoji": "⚡",
    "stats": { "appearances": 24, "goals": 4, "assists": 8, "rating": 8.1 }
  },
  {
    "id": "pl12", "number": 20, "name": "Dani Olmo", "nationality": "Spain",
    "position": "Midfielder", "positionShort": "MID", "age": 26,
    "emoji": "⚡",
    "stats": { "appearances": 28, "goals": 11, "assists": 7, "rating": 8.2 }
  },
  {
    "id": "pl13", "number": 17, "name": "Marc Casadó", "nationality": "Spain",
    "position": "Midfielder", "positionShort": "MID", "age": 21,
    "emoji": "⚡",
    "stats": { "appearances": 30, "goals": 1, "assists": 3, "rating": 7.5 }
  },
  {
    "id": "pl14", "number": 22, "name": "Ilkay Gündogan", "nationality": "Germany",
    "position": "Midfielder", "positionShort": "MID", "age": 36,
    "emoji": "⚡",
    "stats": { "appearances": 22, "goals": 5, "assists": 9, "rating": 7.9 }
  },
  {
    "id": "pl15", "number": 16, "name": "Fermín López", "nationality": "Spain",
    "position": "Midfielder", "positionShort": "MID", "age": 22,
    "emoji": "⚡",
    "stats": { "appearances": 25, "goals": 7, "assists": 5, "rating": 7.8 }
  },
  {
    "id": "pl16", "number": 19, "name": "Lamine Yamal", "nationality": "Spain",
    "position": "Forward", "positionShort": "FWD", "age": 17,
    "emoji": "🌟",
    "stats": { "appearances": 32, "goals": 18, "assists": 15, "rating": 9.1 }
  },
  {
    "id": "pl17", "number": 9, "name": "Robert Lewandowski", "nationality": "Poland",
    "position": "Forward", "positionShort": "FWD", "age": 38,
    "emoji": "🌟",
    "stats": { "appearances": 30, "goals": 24, "assists": 8, "rating": 8.8 }
  },
  {
    "id": "pl18", "number": 11, "name": "Raphinha", "nationality": "Brazil",
    "position": "Forward", "positionShort": "FWD", "age": 27,
    "emoji": "🌟",
    "stats": { "appearances": 32, "goals": 20, "assists": 14, "rating": 8.9 }
  },
  {
    "id": "pl19", "number": 29, "name": "Pau Víctor", "nationality": "Spain",
    "position": "Forward", "positionShort": "FWD", "age": 24,
    "emoji": "🌟",
    "stats": { "appearances": 20, "goals": 8, "assists": 4, "rating": 7.6 }
  }
],
  trophies: [
  { "id": "t1", "name": "La Liga", "count": 27, "emoji": "🏆", "firstWon": 1929, "category": "domestic" },
  { "id": "t2", "name": "Champions League", "count": 5, "emoji": "⭐", "firstWon": 1992, "category": "european" },
  { "id": "t3", "name": "Copa del Rey", "count": 31, "emoji": "🥇", "firstWon": 1910, "category": "domestic" },
  { "id": "t4", "name": "Supercopa de España", "count": 15, "emoji": "🛡️", "firstWon": 1983, "category": "domestic" },
  { "id": "t5", "name": "UEFA Super Cup", "count": 5, "emoji": "🌟", "firstWon": 1992, "category": "european" },
  { "id": "t6", "name": "Club World Cup", "count": 3, "emoji": "🌍", "firstWon": 2009, "category": "world" }
],
  events: [
  {
    "id": "ev1",
    "type": "match",
    "title": "El Clásico Watch Party",
    "description": "Watch FC Barcelona vs Real Madrid live with fellow Culers worldwide!",
    "date": "2026-11-29T20:00:00Z",
    "status": "upcoming",
    "memberOnly": false,
    "attendees": 1240
  },
  {
    "id": "ev2",
    "type": "podcast",
    "title": "Barça Talk: Tactics Deep Dive",
    "description": "Our analysts break down Barça's high-press system and what makes it so effective this season.",
    "date": "2026-11-08T19:00:00Z",
    "status": "upcoming",
    "memberOnly": false,
    "attendees": 380
  },
  {
    "id": "ev3",
    "type": "watch",
    "title": "Champions League Live: Barça vs Bayern",
    "description": "Stream the UCL group stage match together with live commentary from our community.",
    "date": "2026-11-23T20:30:00Z",
    "status": "upcoming",
    "memberOnly": true,
    "attendees": 892
  },
  {
    "id": "ev4",
    "type": "fan",
    "title": "Member Q&A: Ask the Community",
    "description": "Exclusive members-only live Q&A with our most knowledgeable community experts.",
    "date": "2026-11-15T18:00:00Z",
    "status": "upcoming",
    "memberOnly": true,
    "attendees": 215
  },
  {
    "id": "ev5",
    "type": "match",
    "title": "Copa del Rey: Barça vs Valencia",
    "description": "Live match room for Copa del Rey Round of 16.",
    "date": "2026-12-10T20:00:00Z",
    "status": "upcoming",
    "memberOnly": false,
    "attendees": 560
  },
  {
    "id": "ev6",
    "type": "podcast",
    "title": "Transfer Window Special",
    "description": "Who should Barça sign in January? Members debate the best targets for the winter window.",
    "date": "2026-11-20T20:00:00Z",
    "status": "upcoming",
    "memberOnly": true,
    "attendees": 320
  }
],
};
