import { writable, get } from 'svelte/store';
import { saveFile, getAllFiles, getFile, deleteFile, type FileEntry } from '../utils/indexedDB';

export const files = writable<FileEntry[]>([]);
export const currentFileId = writable<string | null>(null);

let saveTimeout: ReturnType<typeof setTimeout>;

export async function initFiles() {
  const loadedFiles = await getAllFiles();
  if (loadedFiles.length === 0) {
    const defaultFile: FileEntry = {
      id: 'Main.lean',
      name: 'Main.lean',
      content: '-- Welcome to Lean AI Workspace\n\n#eval "Hello, world!"\n\ndef myTheorem : 1 + 1 = 2 := rfl\n',
      lastModified: Date.now()
    };
    await saveFile(defaultFile);
    files.set([defaultFile]);
    currentFileId.set(defaultFile.id);
  } else {
    files.set(loadedFiles);
    currentFileId.set(loadedFiles[0].id);
  }
}

export function updateCurrentFileContent(content: string) {
  const currentId = get(currentFileId);
  if (!currentId) return;

  // Optimistic update in memory
  files.update(allFiles => {
    return allFiles.map(f => {
      if (f.id === currentId) {
        return { ...f, content, lastModified: Date.now() };
      }
      return f;
    });
  });

  // Debounced Auto-Save to IndexedDB
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    const currentFiles = get(files);
    const fileToSave = currentFiles.find(f => f.id === currentId);
    if (fileToSave) {
      await saveFile(fileToSave);
      console.log(`Auto-saved ${fileToSave.name}`);
    }
  }, 1000);
}

export async function createNewFile(name: string) {
  let id = name;
  if (!id.endsWith('.lean')) {
    id += '.lean';
    name += '.lean';
  }
  
  const currentFiles = get(files);
  if (currentFiles.find(f => f.id === id)) {
    alert('File already exists!');
    return;
  }

  const newFile: FileEntry = {
    id,
    name,
    content: '',
    lastModified: Date.now()
  };

  await saveFile(newFile);
  files.update(fs => [...fs, newFile]);
  currentFileId.set(id);
}

export async function switchFile(id: string) {
  currentFileId.set(id);
}

export async function deleteFileAndSwitch(id: string) {
  const currentFiles = get(files);
  if (currentFiles.length <= 1) return; // Don't delete the last file
  
  await deleteFile(id);
  files.update(fs => fs.filter(f => f.id !== id));
  
  const activeId = get(currentFileId);
  if (activeId === id) {
    const remaining = get(files);
    currentFileId.set(remaining[0].id);
  }
}

export async function renameFileEntry(id: string, newName: string) {
  let newId = newName;
  if (!newId.endsWith('.lean')) {
    newId += '.lean';
    newName += '.lean';
  }

  const currentFiles = get(files);
  if (currentFiles.find(f => f.id === newId && f.id !== id)) {
    alert('File already exists with this name!');
    return;
  }

  const fileToRename = currentFiles.find(f => f.id === id);
  if (fileToRename) {
    const updatedFile = { ...fileToRename, id: newId, name: newName, lastModified: Date.now() };
    
    // In IndexedDB, changing the key requires delete + put
    await deleteFile(id);
    await saveFile(updatedFile);
    
    files.update(fs => fs.map(f => f.id === id ? updatedFile : f));
    
    if (get(currentFileId) === id) {
      currentFileId.set(newId);
    }
  }
}
