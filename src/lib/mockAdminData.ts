export interface MockPlayer {
  id: string;
  nickname: string;
  playerId: string;
  platform: "PC" | "Mobile";
  team: string;
  country: string;
  email: string;
  role: "player" | "content_creator" | "admin";
  verified: boolean;
}

export interface MockCreatorRequest {
  id: string;
  nickname: string;
  email: string;
  platform: string;
  channelLink: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface MockTournamentReg {
  id: string;
  tournamentName: string;
  teamName: string;
  playerNickname: string;
  playerId: string;
  platform: "PC" | "Mobile";
  registrationDate: string;
}

export interface MockScrimParticipant {
  id: string;
  scrimTitle: string;
  streamer: string;
  playerNickname: string;
  playerId: string;
  team: string;
  platform: "PC" | "Mobile";
  joinTime: string;
}

export interface MockActivityLog {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
  admin: string;
}

export const mockPlayers: MockPlayer[] = [
  { id: "1", nickname: "TitanAlex", playerId: "BS-10001", platform: "PC", team: "Titan Squad", country: "Mexico", email: "titan@gm.com", role: "player", verified: true },
  { id: "2", nickname: "NovaLeo", playerId: "BS-10002", platform: "PC", team: "Nova Clan", country: "Argentina", email: "nova@gm.com", role: "content_creator", verified: true },
  { id: "3", nickname: "ShadowKaze", playerId: "BS-10003", platform: "Mobile", team: "Shadow Ops", country: "Colombia", email: "kaze@gm.com", role: "player", verified: false },
  { id: "4", nickname: "StormWolf", playerId: "BS-10004", platform: "PC", team: "Titan Squad", country: "Chile", email: "storm@gm.com", role: "player", verified: true },
  { id: "5", nickname: "AceViper", playerId: "BS-10005", platform: "Mobile", team: "Nova Clan", country: "Peru", email: "ace@gm.com", role: "player", verified: false },
  { id: "6", nickname: "BlazeFury", playerId: "BS-10006", platform: "PC", team: "Blaze Team", country: "Spain", email: "blaze@gm.com", role: "player", verified: true },
  { id: "7", nickname: "GhostRider", playerId: "BS-10007", platform: "PC", team: "Ghost Unit", country: "Mexico", email: "ghost@gm.com", role: "player", verified: true },
  { id: "8", nickname: "NightHawk", playerId: "BS-10008", platform: "Mobile", team: "Night Crew", country: "Brazil", email: "hawk@gm.com", role: "player", verified: false },
];

export const mockCreatorRequests: MockCreatorRequest[] = [
  { id: "1", nickname: "StreamerJin", email: "jin@gm.com", platform: "Twitch", channelLink: "https://twitch.tv/jin", status: "Pending" },
  { id: "2", nickname: "NovaLeo", email: "nova@gm.com", platform: "YouTube", channelLink: "https://youtube.com/@novaleo", status: "Approved" },
  { id: "3", nickname: "CyberMax", email: "cyber@gm.com", platform: "Twitch", channelLink: "https://twitch.tv/cybermax", status: "Pending" },
  { id: "4", nickname: "FlashPoint", email: "flash@gm.com", platform: "YouTube", channelLink: "https://youtube.com/@flash", status: "Rejected" },
];

export const mockTournamentRegs: MockTournamentReg[] = [
  { id: "1", tournamentName: "BloodStrike Open #4", teamName: "Titan Squad", playerNickname: "TitanAlex", playerId: "BS-10001", platform: "PC", registrationDate: "Mar 10, 2026" },
  { id: "2", tournamentName: "BloodStrike Open #4", teamName: "Titan Squad", playerNickname: "StormWolf", playerId: "BS-10004", platform: "PC", registrationDate: "Mar 10, 2026" },
  { id: "3", tournamentName: "BloodStrike Open #4", teamName: "Nova Clan", playerNickname: "NovaLeo", playerId: "BS-10002", platform: "PC", registrationDate: "Mar 11, 2026" },
  { id: "4", tournamentName: "BloodStrike Open #4", teamName: "Nova Clan", playerNickname: "AceViper", playerId: "BS-10005", platform: "Mobile", registrationDate: "Mar 11, 2026" },
  { id: "5", tournamentName: "Duo Cup #3", teamName: "Shadow Ops", playerNickname: "ShadowKaze", playerId: "BS-10003", platform: "Mobile", registrationDate: "Mar 12, 2026" },
  { id: "6", tournamentName: "Duo Cup #3", teamName: "Blaze Team", playerNickname: "BlazeFury", playerId: "BS-10006", platform: "PC", registrationDate: "Mar 12, 2026" },
];

export const mockScrimParticipants: MockScrimParticipant[] = [
  { id: "1", scrimTitle: "Night Scrim #12", streamer: "TitanAlex", playerNickname: "StormWolf", playerId: "BS-10004", team: "Titan Squad", platform: "PC", joinTime: "20:15" },
  { id: "2", scrimTitle: "Night Scrim #12", streamer: "TitanAlex", playerNickname: "NovaLeo", playerId: "BS-10002", team: "Nova Clan", platform: "PC", joinTime: "20:18" },
  { id: "3", scrimTitle: "Night Scrim #12", streamer: "TitanAlex", playerNickname: "ShadowKaze", playerId: "BS-10003", team: "Shadow Ops", platform: "Mobile", joinTime: "20:20" },
  { id: "4", scrimTitle: "Duo Practice", streamer: "NovaLeo", playerNickname: "BlazeFury", playerId: "BS-10006", team: "Blaze Team", platform: "PC", joinTime: "18:00" },
  { id: "5", scrimTitle: "Duo Practice", streamer: "NovaLeo", playerNickname: "GhostRider", playerId: "BS-10007", team: "Ghost Unit", platform: "PC", joinTime: "18:05" },
];

export const mockActivityLog: MockActivityLog[] = [
  { id: "1", action: "Player Deleted", detail: "Removed duplicate account: FakePlayer99", timestamp: "Mar 11, 2026 14:30", admin: "AdminRoot" },
  { id: "2", action: "Creator Approved", detail: "Approved NovaLeo as content creator", timestamp: "Mar 11, 2026 12:15", admin: "AdminRoot" },
  { id: "3", action: "Tournament Created", detail: "Created BloodStrike Open #4", timestamp: "Mar 10, 2026 09:00", admin: "AdminRoot" },
  { id: "4", action: "Scrim Created", detail: "Created Night Scrim #12", timestamp: "Mar 10, 2026 19:00", admin: "AdminRoot" },
  { id: "5", action: "Data Exported", detail: "Exported player list (124 records)", timestamp: "Mar 9, 2026 16:45", admin: "AdminRoot" },
  { id: "6", action: "Lobby Generated", detail: "Generated 2 lobbies for BloodStrike Open #4", timestamp: "Mar 9, 2026 15:00", admin: "AdminRoot" },
];

export const mockTournaments = [
  { id: "1", name: "BloodStrike Open #4", mode: "Squad" as const },
  { id: "2", name: "Duo Cup #3", mode: "Duo" as const },
  { id: "3", name: "Solo Showdown #2", mode: "Solo" as const },
];
