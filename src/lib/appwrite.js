import {
  Client,
  Account,
  TablesDB,
  Storage,
  ID,
  Query,
  Permission,
  Role
} from 'appwrite';

export const client = new Client()
  .setEndpoint(
    import.meta.env.VITE_APPWRITE_ENDPOINT ||
    'https://sgp.cloud.appwrite.io/v1'
  )
  .setProject(
    import.meta.env.VITE_APPWRITE_PROJECT_ID || ''
  );

export const account = new Account(client);
export const tables = new TablesDB(client);
export const storage = new Storage(client);

export { ID, Query, Permission, Role };

export const cfg = {
  db: import.meta.env.VITE_APPWRITE_DATABASE_ID || 'niko_ai',

  users:
    import.meta.env.VITE_APPWRITE_USERS_TABLE_ID || 'users',

  conversations:
    import.meta.env.VITE_APPWRITE_CONVERSATIONS_TABLE_ID ||
    'conversations',

  messages:
    import.meta.env.VITE_APPWRITE_MESSAGES_TABLE_ID ||
    'messages',

  memories:
    import.meta.env.VITE_APPWRITE_MEMORIES_TABLE_ID ||
    'memories',

  tasks:
    import.meta.env.VITE_APPWRITE_TASKS_TABLE_ID ||
    'tasks',

  settings:
    import.meta.env.VITE_APPWRITE_SETTINGS_TABLE_ID ||
    'user_settings',

  bucket:
    import.meta.env.VITE_APPWRITE_FILES_BUCKET_ID ||
    'niko_files',

  aiFunction:
    import.meta.env.VITE_APPWRITE_AI_FUNCTION_ID ||
    'niko_ai_api'
};

export async function currentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

export async function signOut() {
  await account.deleteSession('current');
}

export async function createUserProfile(user) {
  try {
    await tables.createRow({
      databaseId: cfg.db,
      tableId: cfg.users,
      rowId: user.$id,
      data: {
        userId: user.$id,
        email: user.email,
        name: user.name || '',
        createdAt: new Date().toISOString()
      },
      permissions: [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id))
      ]
    });
  } catch (e) {
    if (e?.code !== 409) throw e;
  }
}