
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum AuditActionType {
    CREATE = "CREATE",
    DELETE = "DELETE",
    UPDATE = "UPDATE"
}

export enum AuditEntityType {
    DailyGame = "DailyGame",
    Game = "Game",
    GameSession = "GameSession",
    Transaction = "Transaction",
    User = "User"
}

export enum GameKqjCards {
    CLUBS = "CLUBS",
    DIAMONDS = "DIAMONDS",
    HEARTS = "HEARTS",
    JACK = "JACK",
    JACK_OF_CLUBS = "JACK_OF_CLUBS",
    JACK_OF_DIAMONDS = "JACK_OF_DIAMONDS",
    JACK_OF_HEARTS = "JACK_OF_HEARTS",
    JACK_OF_SPADES = "JACK_OF_SPADES",
    KING = "KING",
    KING_OF_CLUBS = "KING_OF_CLUBS",
    KING_OF_DIAMONDS = "KING_OF_DIAMONDS",
    KING_OF_HEARTS = "KING_OF_HEARTS",
    KING_OF_SPADES = "KING_OF_SPADES",
    QUEEN = "QUEEN",
    QUEEN_OF_CLUBS = "QUEEN_OF_CLUBS",
    QUEEN_OF_DIAMONDS = "QUEEN_OF_DIAMONDS",
    QUEEN_OF_HEARTS = "QUEEN_OF_HEARTS",
    QUEEN_OF_SPADES = "QUEEN_OF_SPADES",
    SPADES = "SPADES"
}

export enum GameRouletteNumbers {
    EIGTH = "EIGTH",
    FIVE = "FIVE",
    FOUR = "FOUR",
    NINE = "NINE",
    ONE = "ONE",
    SEVEN = "SEVEN",
    SIX = "SIX",
    TEN = "TEN",
    THREE = "THREE",
    TWO = "TWO"
}

export enum GameSessionStatus {
    END = "END",
    INACTIVE = "INACTIVE",
    LIVE = "LIVE",
    UPCOMING = "UPCOMING"
}

export enum GameStatus {
    AVAILABLE = "AVAILABLE",
    FINISHED = "FINISHED",
    UNAVAILABLE = "UNAVAILABLE",
    UPCOMING = "UPCOMING"
}

export enum GameType {
    KQJ = "KQJ",
    ROULETTE = "ROULETTE"
}

export enum MessageType {
    AUDIO = "AUDIO",
    IMAGE = "IMAGE",
    INFO = "INFO",
    MESSAGE = "MESSAGE",
    TRADE = "TRADE",
    VIDEO = "VIDEO"
}

export enum NotificationStatus {
    READ = "READ",
    UNREAD = "UNREAD"
}

export enum NotificationType {
    COMMENT = "COMMENT",
    LIKE = "LIKE",
    MESSAGE = "MESSAGE",
    SYSTEM = "SYSTEM"
}

export enum RecordSessionStatus {
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    SUSPENDED = "SUSPENDED"
}

export enum Role {
    ADMIN = "ADMIN",
    ANNOUNCER = "ANNOUNCER",
    GUEST = "GUEST",
    MASTER = "MASTER",
    SUPERADMIN = "SUPERADMIN",
    SYSTEM = "SYSTEM",
    USER = "USER"
}

export enum TokenValues {
    TOKEN_11 = "TOKEN_11",
    TOKEN_55 = "TOKEN_55",
    TOKEN_100 = "TOKEN_100",
    TOKEN_110 = "TOKEN_110",
    TOKEN_550 = "TOKEN_550",
    TOKEN_1100 = "TOKEN_1100",
    TOKEN_5500 = "TOKEN_5500"
}

export enum TransactionType {
    CREDIT = "CREDIT",
    DEBIT = "DEBIT"
}

export enum UserGameResultStatus {
    LOSS = "LOSS",
    WIN = "WIN"
}

export enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED"
}

export interface AddUserDto {
    city: string;
    email: string;
    password: string;
    phone_number: string;
    role: Role;
    username: string;
}

export interface AuditLogFiltersInput {
    action?: Nullable<string>;
    entity?: Nullable<string>;
    skip: number;
    take: number;
}

export interface CreateGameRouletteDto {
    admin_id: number;
    end_date: DateTime;
    end_time: string;
    game_duration: number;
    game_in_day: number;
    game_status: GameStatus;
    game_type: GameType;
    start_date: DateTime;
    start_time: string;
}

export interface CreateGamesDto {
    admin_id: number;
    end_date: DateTime;
    end_time: string;
    game_duration: number;
    game_in_day: number;
    game_status: GameStatus;
    game_type: GameType;
    start_date: DateTime;
    start_time: string;
}

export interface CreateNotificationInput {
    message: string;
    title: string;
    type: NotificationType;
    userId?: Nullable<number>;
}

export interface CreatePermissionInput {
    action: string;
    allowed: boolean;
    role?: Nullable<Role>;
    userId?: Nullable<number>;
}

export interface CreateRecordSessionKqjDto {
    choosen_card: GameKqjCards;
    gameSessionId: number;
    record_status: RecordSessionStatus;
    token: TokenValues;
    userId: number;
}

export interface CreateTransactionSessionDto {
    game_status: UserGameResultStatus;
    recordSessionId: number;
    token: TokenValues;
}

export interface DateFilterDto {
    endDate?: Nullable<DateTime>;
    startDate?: Nullable<DateTime>;
}

export interface PaginationMetadataDto {
    count?: Nullable<number>;
    skip: number;
    take: number;
}

export interface ResetPasswordDto {
    confirmPassword: string;
    currentPassword: string;
    id: number;
    newPassword: string;
}

export interface SignInCredential {
    password: string;
    username: string;
}

export interface SignUpCredential {
    city: string;
    email: string;
    password: string;
    phone_number: string;
    role?: Nullable<Role>;
    username: string;
}

export interface SuspendUserDto {
    suspend: boolean;
    userId: number;
}

export interface UpdateGameRouletteDto {
    admin_id: number;
    end_date: DateTime;
    end_time: string;
    game_duration?: Nullable<number>;
    game_id: number;
    game_in_day?: Nullable<number>;
    game_status?: Nullable<GameStatus>;
    game_type?: Nullable<GameType>;
    start_date: DateTime;
    start_time: string;
}

export interface UpdateGameSessionRouletteDto {
    game_result_roulette_number: GameRouletteNumbers;
}

export interface UpdateGamesDto {
    admin_id: number;
    end_date: DateTime;
    end_time: string;
    game_duration?: Nullable<number>;
    game_id: number;
    game_in_day?: Nullable<number>;
    game_status?: Nullable<GameStatus>;
    game_type?: Nullable<GameType>;
    start_date: DateTime;
    start_time: string;
}

export interface UpdateNotificationInput {
    deletedAt?: Nullable<DateTime>;
    deletedBy?: Nullable<string>;
    id: number;
    message?: Nullable<string>;
    status?: Nullable<NotificationStatus>;
    title?: Nullable<string>;
    type?: Nullable<NotificationType>;
}

export interface UpdateUserDto {
    address?: Nullable<string>;
    city?: Nullable<string>;
    email?: Nullable<string>;
    first_time_password_reset?: Nullable<boolean>;
    name?: Nullable<string>;
    otp?: Nullable<string>;
    phone_number?: Nullable<string>;
    role?: Nullable<Role>;
    status?: Nullable<UserStatus>;
    username?: Nullable<string>;
    wallet?: Nullable<number>;
    wallet_limit?: Nullable<number>;
}

export interface UserFiltersInput {
    city?: Nullable<string>;
    email?: Nullable<string>;
    id?: Nullable<number>;
    name?: Nullable<string>;
    phone_number?: Nullable<string>;
    role?: Nullable<Role>;
    skip: number;
    status?: Nullable<UserStatus>;
    take: number;
    username?: Nullable<string>;
}

export interface WalletDto {
    token: TokenValues;
    type: TransactionType;
}

export interface AuditLog {
    action: AuditActionType;
    createdAt: DateTime;
    createdBy: string;
    deletedAt: DateTime;
    deletedBy: string;
    details?: Nullable<string>;
    entity: AuditEntityType;
    id: number;
    updatedAt: DateTime;
    updatedBy: string;
    user_id?: Nullable<User>;
}

export interface DailyGame {
    createdAt: DateTime;
    createdBy: string;
    deletedAt: DateTime;
    deletedBy: string;
    games: Games;
    id: number;
    updatedAt: DateTime;
    updatedBy: string;
}

export interface DailyGameRoulette {
    createdAt: DateTime;
    createdBy: string;
    deletedAt: DateTime;
    deletedBy: string;
    game_roulette: GameRoulette;
    id: number;
    updatedAt: DateTime;
    updatedBy: string;
}

export interface DailyWinnersAndLosers {
    losers: number;
    winners: number;
}

export interface GameResultRoulette {
    createdAt: DateTime;
    createdBy: string;
    deletedAt: DateTime;
    deletedBy: string;
    game_status: UserGameResultStatus;
    id: number;
    record_session_roulette: RecordSessionRoulette;
    token: number;
    updatedAt: DateTime;
    updatedBy: string;
}

export interface GameRoulette {
    admin: User;
    createdAt: DateTime;
    createdBy: string;
    daily_game_roulette?: Nullable<DailyGameRoulette[]>;
    deletedAt: DateTime;
    deletedBy: string;
    end_date: DateTime;
    end_time: string;
    game_duration: number;
    game_in_day: number;
    game_session_roulette?: Nullable<GameSessionRoulette[]>;
    game_status: GameStatus;
    game_type: GameType;
    id: number;
    start_date: DateTime;
    start_time: string;
    updatedAt: DateTime;
    updatedBy: string;
}

export interface GameSession {
    createdAt: DateTime;
    createdBy: string;
    deletedAt: DateTime;
    deletedBy: string;
    game: Games;
    game_result_card?: Nullable<GameKqjCards>;
    id: number;
    record_session_kqj?: Nullable<RecordSessionKqj>;
    session_end_time?: Nullable<DateTime>;
    session_start_time?: Nullable<DateTime>;
    session_status: GameSessionStatus;
    updatedAt: DateTime;
    updatedBy: string;
}

export interface GameSessionRoulette {
    createdAt: DateTime;
    createdBy: string;
    deletedAt: DateTime;
    deletedBy: string;
    game_result_number?: Nullable<GameRouletteNumbers>;
    game_roulette: GameRoulette;
    id: number;
    record_session_roulette?: Nullable<RecordSessionRoulette>;
    session_end_time?: Nullable<DateTime>;
    session_start_time?: Nullable<DateTime>;
    session_status: GameSessionStatus;
    updatedAt: DateTime;
    updatedBy: string;
}

export interface Games {
    DailyGame?: Nullable<DailyGame[]>;
    admin: User;
    createdAt: DateTime;
    createdBy: string;
    deletedAt: DateTime;
    deletedBy: string;
    end_date: DateTime;
    end_time: string;
    gameSession?: Nullable<GameSession[]>;
    game_duration: number;
    game_in_day: number;
    game_status: GameStatus;
    game_type: GameType;
    id: number;
    start_date: DateTime;
    start_time: string;
    updatedAt: DateTime;
    updatedBy: string;
}

export interface GuestToken {
    access_token: string;
    refresh_token: string;
    role: Role;
}

export interface Message {
    createdAt: DateTime;
    createdBy: string;
    deletedAt: DateTime;
    deletedBy: string;
    exampleField: number;
    id: number;
    imageUrl: string;
    message: string;
    messageType: MessageType;
    updatedAt: DateTime;
    updatedBy: string;
}

export interface IMutation {
    DeleteGames(id: number): boolean | Promise<boolean>;
    addUser(addUserDto: AddUserDto): User | Promise<User>;
    adminSignUp(signUpCredential: SignUpCredential): User | Promise<User>;
    createGameRoulette(createGameRouletteDto: CreateGameRouletteDto): GameRoulette | Promise<GameRoulette>;
    createGames(createGamesDto: CreateGamesDto): Games | Promise<Games>;
    createNotification(createNotificationInput: CreateNotificationInput): Notification | Promise<Notification>;
    createPermission(createPermissionInput: CreatePermissionInput): Permission | Promise<Permission>;
    createRecordSession(createRecordSessionKqjDto: CreateRecordSessionKqjDto): RecordSessionKqj | Promise<RecordSessionKqj>;
    createTransactionSession(createTransactionSessionDto: CreateTransactionSessionDto): TransactionSession | Promise<TransactionSession>;
    deleteGameRoulette(id: number): boolean | Promise<boolean>;
    deleteUser(adminId: number, userId: number): boolean | Promise<boolean>;
    markSessionAsCompleted(gameSessionId: number): boolean | Promise<boolean>;
    refreshAccessToken(refreshToken: string, token: string): Token | Promise<Token>;
    removeSessionFromGame(deleteBy: number, gameSessionId: number): boolean | Promise<boolean>;
    removeUserFromGame(deleteBy: number, gameSessionId: number, userId: number): boolean | Promise<boolean>;
    resetPassword(resetPasswordDto: ResetPasswordDto): string | Promise<string>;
    restrictRoleAction(action: string, role: Role): string | Promise<string>;
    restrictUserAction(action: string, userId: number): string | Promise<string>;
    sendOtp(mobile: string): string | Promise<string>;
    suspendUser(suspendUserDto: SuspendUserDto): User | Promise<User>;
    unrestrictRoleAction(action: string, role: Role): string | Promise<string>;
    unrestrictUserAction(action: string, userId: number): string | Promise<string>;
    updateGameRoulette(updateGameRouletteDto: UpdateGameRouletteDto): GameRoulette | Promise<GameRoulette>;
    updateGameSession(id: number, updateGameSessionRouletteDto: UpdateGameSessionRouletteDto): GameSessionRoulette | Promise<GameSessionRoulette>;
    updateGames(updateGamesDto: UpdateGamesDto): Games | Promise<Games>;
    updateNotification(updateNotificationInput: UpdateNotificationInput): Notification | Promise<Notification>;
    updateUser(id: number, updateUserDto: UpdateUserDto): User | Promise<User>;
    updateUserRecordStatus(gameSessionId: number, recordStatus: RecordSessionStatus, userId: number): RecordSessionKqj | Promise<RecordSessionKqj>;
    updateUserWallet(id: number, updateUserDto: UpdateUserDto): User | Promise<User>;
    updateWallet(adminId: number, userId: number, walletData: WalletDto): Transaction | Promise<Transaction>;
    userSignUp(signUpCredential: SignUpCredential): User | Promise<User>;
    verifyOtp(mobile: string, otp: string): string | Promise<string>;
}

export interface Notification {
    createdAt: DateTime;
    createdBy: string;
    deletedAt: DateTime;
    deletedBy: string;
    id: number;
    message: string;
    status: NotificationStatus;
    title: string;
    type: NotificationType;
    updatedAt: DateTime;
    updatedBy: string;
}

export interface PaginatedAuditLogDto {
    count: number;
    data: AuditLog[];
    skip: number;
    take: number;
}

export interface PaginatedGameRouletteDto {
    count: number;
    data: Games[];
    skip: number;
    take: number;
}

export interface PaginatedGameSessionKqjDto {
    count: number;
    data: GameSession[];
    skip: number;
    take: number;
}

export interface PaginatedGameSessionRouletteDto {
    count: number;
    data: GameSessionRoulette[];
    skip: number;
    take: number;
}

export interface PaginatedGamesDto {
    count: number;
    data: Games[];
    skip: number;
    take: number;
}

export interface PaginatedUserDto {
    count: number;
    data: User[];
    skip: number;
    take: number;
}

export interface Permission {
    action: string;
    allowed: boolean;
    createdAt: DateTime;
    createdBy: string;
    deletedAt: DateTime;
    deletedBy: string;
    id: number;
    role?: Nullable<Role>;
    updatedAt: DateTime;
    updatedBy: string;
    user?: Nullable<User>;
}

export interface ProfitAndLoss {
    loss: number;
    net: number;
    profit: number;
}

export interface IQuery {
    GuestSignIn(): GuestToken | Promise<GuestToken>;
    getAllAuditLog(AuditLogFiltersInput: AuditLogFiltersInput): PaginatedAuditLogDto | Promise<PaginatedAuditLogDto>;
    getAllGameSessions(skip: number, take: number): PaginatedGameSessionRouletteDto | Promise<PaginatedGameSessionRouletteDto>;
    getAllGamesRoulette(skip: number, take: number): PaginatedGameRouletteDto | Promise<PaginatedGameRouletteDto>;
    getAllGameses(skip: number, take: number): PaginatedGamesDto | Promise<PaginatedGamesDto>;
    getAllRecordSessions(): RecordSessionKqj[] | Promise<RecordSessionKqj[]>;
    getAllRecordsBySessionId(sessionId: number): RecordSessionKqjPagination | Promise<RecordSessionKqjPagination>;
    getAllTransactionSessions(): TransactionSession[] | Promise<TransactionSession[]>;
    getAllUsers(skip: number, take: number): PaginatedUserDto | Promise<PaginatedUserDto>;
    getCurrentRunningSessions(): GameSession[] | Promise<GameSession[]>;
    getDailyWinnersAndLosers(): DailyWinnersAndLosers | Promise<DailyWinnersAndLosers>;
    getDeletedNotifications(userId: number): Notification[] | Promise<Notification[]>;
    getFinishedSessionsByDateOrToday(filter?: Nullable<DateFilterDto>): number | Promise<number>;
    getGameResultByUserId(userId: number): TransactionSession[] | Promise<TransactionSession[]>;
    getGameRouletteByDateOrToday(filter?: Nullable<DateFilterDto>): GameRoulette[] | Promise<GameRoulette[]>;
    getGameSessionRouletteById(id: number): GameSessionRoulette | Promise<GameSessionRoulette>;
    getGameSessionsRouletteByDateOrToday(filter?: Nullable<DateFilterDto>): GameSessionRoulette[] | Promise<GameSessionRoulette[]>;
    getGamesBy(id: number): GameRoulette | Promise<GameRoulette>;
    getGamesByDate(filter?: Nullable<DateFilterDto>): Games[] | Promise<Games[]>;
    getGamesByDateOrToday(filter?: Nullable<DateFilterDto>): Games[] | Promise<Games[]>;
    getLiveGameSessionRoulette(): Nullable<GameSessionRoulette> | Promise<Nullable<GameSessionRoulette>>;
    getPermissions(role?: Nullable<Role>, userId?: Nullable<number>): Permission[] | Promise<Permission[]>;
    getProfitAndLoss(date?: Nullable<DateTime>): ProfitAndLoss | Promise<ProfitAndLoss>;
    getRecordSessionBy(id: number): RecordSessionKqj | Promise<RecordSessionKqj>;
    getRecordsBy(UserId: number): RecordSessionKqj[] | Promise<RecordSessionKqj[]>;
    getRecordsByDate(filter?: Nullable<DateFilterDto>): RecordSessionKqj[] | Promise<RecordSessionKqj[]>;
    getTotalSessionsDateOrToday(filter?: Nullable<DateFilterDto>): number | Promise<number>;
    getTotalTokensToday(filter?: Nullable<DateFilterDto>): number | Promise<number>;
    getTotalUsersByDateOrToday(filter?: Nullable<DateFilterDto>): number | Promise<number>;
    getTransactionSessionById(id: number): TransactionSession | Promise<TransactionSession>;
    getTransactionsByDate(filter?: Nullable<DateFilterDto>): TransactionSession[] | Promise<TransactionSession[]>;
    getTransactionsByUserId(userId: number): Transaction[] | Promise<Transaction[]>;
    getUpcomingSessions(): GameSession[] | Promise<GameSession[]>;
    getUserById(id: number): User | Promise<User>;
    getUserByRole(role: string): User[] | Promise<User[]>;
    getUserNotifications(userId: number): Notification[] | Promise<Notification[]>;
    getUsersByCreatedAt(date: DateTime): User[] | Promise<User[]>;
    searchRecords(offset: PaginationMetadataDto, searchTerm: string, sessionId: number): RecordSessionKqjPagination | Promise<RecordSessionKqjPagination>;
    searchUser(UserFiltersInput: UserFiltersInput): PaginatedUserDto | Promise<PaginatedUserDto>;
    signIn(signInCredential: SignInCredential): UserToken | Promise<UserToken>;
}

export interface RecordSessionKqj {
    choosen_card: GameKqjCards;
    createdAt: DateTime;
    createdBy: string;
    deletedAt: DateTime;
    deletedBy: string;
    game_session_id: GameSession;
    id: number;
    record_status: RecordSessionStatus;
    token: TokenValues;
    transaction_session?: Nullable<TransactionSession>;
    updatedAt: DateTime;
    updatedBy: string;
    user: User;
}

export interface RecordSessionKqjPagination {
    data: RecordSessionKqj[];
    totalSize: number;
}

export interface RecordSessionRoulette {
    choosen_number: GameRouletteNumbers;
    createdAt: DateTime;
    createdBy: string;
    deletedAt: DateTime;
    deletedBy: string;
    game_result_roulette?: Nullable<GameResultRoulette>;
    game_session_roulette: GameSessionRoulette;
    id: number;
    record_status: RecordSessionStatus;
    token: TokenValues;
    updatedAt: DateTime;
    updatedBy: string;
    user: User;
}

export interface Room {
    createdAt: DateTime;
    createdBy: string;
    deletedAt: DateTime;
    deletedBy: string;
    id: number;
    latestMessage: Message;
    members: User[];
    messages: Message[];
    updatedAt: DateTime;
    updatedBy: string;
}

export interface Token {
    access_token: string;
    refresh_token: string;
}

export interface Transaction {
    admin: User;
    amount: number;
    createdAt: DateTime;
    createdBy: string;
    deletedAt: DateTime;
    deletedBy: string;
    id: number;
    transactionDate: DateTime;
    type: TransactionType;
    updatedAt: DateTime;
    updatedBy: string;
    user: User;
}

export interface TransactionSession {
    createdAt: DateTime;
    createdBy: string;
    deletedAt: DateTime;
    deletedBy: string;
    game_status: UserGameResultStatus;
    id: number;
    record_session_kqj: RecordSessionKqj;
    token: number;
    updatedAt: DateTime;
    updatedBy: string;
}

export interface User {
    address?: Nullable<string>;
    audit_log_id: AuditLog;
    city: string;
    createdAt: DateTime;
    createdBy: string;
    createdGames: Games;
    deletedAt: DateTime;
    deletedBy: string;
    email: string;
    first_time_password_reset: boolean;
    game_roulete: GameRoulette;
    id: number;
    name?: Nullable<string>;
    otp?: Nullable<string>;
    password: string;
    permissions: Permission;
    phone_number: string;
    profile?: Nullable<string>;
    record_session_kqj: RecordSessionKqj;
    record_session_roulette: RecordSessionRoulette;
    role: Role;
    roomMember: Room;
    status: UserStatus;
    updatedAt: DateTime;
    updatedBy: string;
    userTransactions: Transaction;
    username: string;
    wallet: number;
    wallet_limit: number;
}

export interface UserToken {
    access_token: string;
    refresh_token: string;
    user: User;
}

export type DateTime = any;
type Nullable<T> = T | null;
