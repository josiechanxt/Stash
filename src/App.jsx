import { useEffect, useMemo, useRef, useState } from 'react';
import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';
import landingLogo from '../assets/Stash2.svg';
import landingFrame1 from '../assets/Asset 01.svg';
import landingFrame2 from '../assets/Asset 02.svg';
import landingFrame3 from '../assets/Asset 03.svg';
import landingFrame4 from '../assets/Asset 04.svg';
import landingFrame5 from '../assets/Asset 05.svg';
import landingFrame6 from '../assets/Asset 06.svg';
import landingFrame7 from '../assets/Asset 07.svg';
import landingFrame8 from '../assets/Asset 08.svg';
import landingFrame9 from '../assets/Asset 09.svg';

// A new storage namespace ensures prior demo or pre-landing libraries do not
// appear for visitors opening this release for the first time.
const storageKey = 'stash-folders-v5';
const folderColors = ['#D00000', '#11922B', '#004DAA', '#c5ab68', '#111111', '#E45F00'];
const folderPickerColors = ['#F39294', '#91D99A', '#82B2DD', '#EFD99B', '#8d8d8d', '#FFAD7C'];
const landingFrames = [landingFrame1, landingFrame2, landingFrame3, landingFrame4, landingFrame5, landingFrame6, landingFrame7, landingFrame8, landingFrame9];

const channels = (hex, shade = 1) => {
  const value = Number.parseInt(hex.slice(1), 16);
  return [value >> 16, (value >> 8) & 255, value & 255].map((channel) => Math.round(channel * shade)).join(' ');
};
const isLightColor = (hex) => {
  const value = Number.parseInt(hex.slice(1), 16);
  const [red, green, blue] = [value >> 16, (value >> 8) & 255, value & 255];
  return red * 0.2126 + green * 0.7152 + blue * 0.0722 > 235;
};
const contrastingTextColor = (hex) => {
  const value = Number.parseInt(hex.slice(1), 16);
  const channels = [value >> 16, (value >> 8) & 255, value & 255].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return luminance > 0.179 ? '#000' : '#fff';
};
const swatchTone = (hex) => {
  const value = Number.parseInt(hex.slice(1), 16);
  const [red, green, blue] = [value >> 16, (value >> 8) & 255, value & 255];
  const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
  if (luminance < 105) return 'dark';
  if (luminance > 205) return 'bright';
  return '';
};
const findFolder = (folders, id) => folders.find((folder) => folder.id === id);

function GridWarpFilter() {
  return <svg className="glass-filter-defs" aria-hidden="true">
    <filter id="folder-grid-warp" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018 0.027" numOctaves="1" seed="11" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>;
}

function FolderArt({ folder }) {
  const images = folder.items.slice(0, 3);
  return <div className="folder-art" style={{ '--folder': folder.color, '--folder-rgb': channels(folder.color), '--folder-dark-rgb': channels(folder.color, .62) }}>
    <svg className="folder-waves" viewBox="0 0 160 24" preserveAspectRatio="none" aria-hidden="true"><path fill="currentColor" d="M0 7 C20 2 38 11 58 6 C80 1 102 11 124 6 C143 2 152 7 160 4 V24 H0 Z" /></svg>
    <div className="art-items">{images.map((item, index) => <img key={item.id} className={`art-item art-item-${index}`} src={item.src} alt="" />)}</div>
    <span className="folder-icon">{folder.icon}</span>
  </div>;
}

function SearchBox({ value, onChange }) {
  return <label className="search-box"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search" value={value} onChange={(event) => onChange(event.target.value)} autoComplete="off" aria-label="Search stashes and items" /></label>;
}

function Landing({ onEnter }) {
  return <main className="landing-screen">
    <div className="landing-brand"><img src={landingLogo} alt="Stash" /></div>
    <div className="landing-art" aria-hidden="true">{landingFrames.map((frame, index) => <img key={frame} src={frame} alt="" style={{ '--frame-index': index }} />)}</div>
    <p className="landing-message">Turn physical inspiration<br />into digital artefacts.</p>
    <button className="landing-cta" type="button" onClick={onEnter}>Let’s Stash</button>
  </main>;
}

function Home({ folders, search, setSearch, openFolder, openItem, openFolderModal, openItemModal }) {
  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return null;
    const terms = query.split(/\s+/);
    return folders.flatMap((folder) => folder.items.map((item) => ({ ...item, folder }))).filter((item) => {
      const nameWords = item.name.toLowerCase().split(/\s+/);
      return terms.every((term) => nameWords.some((word) => word.startsWith(term)));
    });
  }, [folders, search]);
  return <section className={`screen ${matches ? 'search-screen' : 'home-screen'}`}>
    <div className="intro"><img className="brand-logo" src={`${import.meta.env.BASE_URL}stash.svg`} alt="Stash" /><div className="actions"><button className="btn btn-dark primary-action" onClick={openFolderModal}>Create Stash</button>{folders.length > 0 && <button className="btn btn-orange primary-action" onClick={openItemModal}>Add Item</button>}</div><SearchBox value={search} onChange={setSearch} /></div>
    {matches ? <><p className="result-count">{matches.length} {matches.length === 1 ? 'Result' : 'Results'}</p><div className="search-grid">{matches.length ? matches.map((item) => <button key={`${item.folder.id}-${item.id}`} className="search-result" onClick={() => openItem(item.folder.id, item.id)}><img src={item.src} alt={item.name} /><span>{item.name}</span></button>) : <p className="empty">No items match that search.</p>}</div></> : <div className="folder-grid">{folders.length ? folders.map((folder) => <button key={folder.id} className="folder-card" onClick={() => openFolder(folder.id)}><FolderArt folder={folder} /><strong>{folder.name}</strong><small>{folder.items.length} {folder.items.length === 1 ? 'item' : 'items'}</small></button>) : <p className="empty">Empty for now. Create your first stash!</p>}</div>}
  </section>;
}

function Collection({ folder, onBack, openItem, openItemModal, openEditModal, openDeleteModal }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const folderStyle = {
    '--folder-rgb': channels(folder.color),
    '--folder-dark-rgb': channels(folder.color, .62),
    '--folder-text': contrastingTextColor(folder.color),
  };
  const chooseMenuAction = (action) => { setMenuOpen(false); action(); };
  return <section className="screen collection-screen"><header className="topbar"><button className="round-btn" onClick={onBack} aria-label="Back to stashes">←</button><div className="collection-actions"><button className="btn btn-orange primary-action" onClick={openItemModal}>Add Item</button><div className="stash-menu"><button className="kebab-btn" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Stash options" aria-expanded={menuOpen}>⋮</button>{menuOpen && <div className="stash-menu-panel" role="menu"><p>Stash options</p><button type="button" role="menuitem" onClick={() => chooseMenuAction(openEditModal)}>Edit</button><button type="button" role="menuitem" className="stash-menu-delete" onClick={() => chooseMenuAction(openDeleteModal)}>Delete</button></div>}</div></div></header><div className="collection-heading"><span className="collection-folder-icon" aria-hidden="true">{folder.icon}</span><div><h2>{folder.name}</h2><p className="collection-count">{folder.items.length} {folder.items.length === 1 ? 'item' : 'items'}</p></div></div><div className="collection-folder" style={folderStyle}><svg className="collection-folder__waves" viewBox="0 0 160 24" preserveAspectRatio="none" aria-hidden="true"><path fill="currentColor" d="M0 7 C20 2 38 11 58 6 C80 1 102 11 124 6 C143 2 152 7 160 4 V24 H0 Z" /></svg><div className="collection-folder__scroll"><div className="collection-item-grid">{folder.items.length ? folder.items.map((item) => <button key={item.id} className="item-card" onClick={() => openItem(folder.id, item.id)}><img src={item.src} alt={item.name} /><strong>{item.name}</strong><small>{item.material}</small></button>) : <p className="empty">This stash is ready for its first find.</p>}</div></div></div></section>;
}

function Detail({ folder, item, onBack, openEditItemModal, openDeleteItemModal }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const chooseMenuAction = (action) => { setMenuOpen(false); action(); };
  return <section className="screen detail-screen"><header className="topbar"><button className="round-btn" onClick={onBack} aria-label="Back to collection">←</button><div className="stash-menu"><button className="kebab-btn" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Item options" aria-expanded={menuOpen}>⋮</button>{menuOpen && <div className="stash-menu-panel" role="menu"><p>Item options</p><button type="button" role="menuitem" onClick={() => chooseMenuAction(openEditItemModal)}>Edit</button><button type="button" role="menuitem" className="stash-menu-delete" onClick={() => chooseMenuAction(openDeleteItemModal)}>Delete</button></div>}</div></header><div className="detail-image"><img src={item.src} alt={item.name} /></div><div className="detail-copy"><h2>{item.name}</h2>{item.material && <div className="detail-meta"><span>Category: Packaging</span><span>Material: {item.material}</span></div>}{item.notes && <p className="notes">{item.notes}</p>}{item.colors?.length > 0 && <div className="colour-row">{item.colors.map((color) => <span key={color} className={isLightColor(color) ? 'light-colour' : ''} style={{ '--chip': color, '--chip-text': contrastingTextColor(color) }} title={color}>{color}</span>)}</div>}<button className="detail-stash" type="button" onClick={onBack}><span>{folder.icon}</span>{folder.name}</button></div></section>;
}

function FolderModal({ close, createFolder, folder, updateFolder }) {
  const [color, setColor] = useState(folder?.color || '#D00000');
  const [icon, setIcon] = useState(folder?.icon || '✨');
  const isEditing = Boolean(folder);
  const colors = folderColors.map((value, index) => ({ value, preview: folderPickerColors[index] }));
  const icons = ['🍔', '🥤', '🧸', '🌅', '🔑', '💌', '🌻', '🇯🇵', '✈️', '📦', '🎀', '⭐'];
  const submit = (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const details = { name: form.get('name').trim(), description: form.get('description').trim(), color, icon }; if (isEditing) updateFolder(folder.id, details); else createFolder(details); };
  return <div className="overlay"><form className="modal folder-modal" onSubmit={submit}><button className="close" type="button" onClick={close} aria-label="Close">×</button><div className="folder-preview"><FolderArt folder={{ color, icon, items: [] }} /></div><label><span className="field-label">Stash name <span className="required-marker" aria-hidden="true">*</span></span><input className="field" name="name" required maxLength="42" placeholder="e.g. Retro packaging" defaultValue={folder?.name} autoFocus /></label><label>Description<input className="field" name="description" maxLength="80" placeholder="Graphic design inspo" defaultValue={folder?.description} /></label><div className="folder-picker"><p>Colour</p><div className="swatches">{colors.map((swatch) => <button key={swatch.value} type="button" className={`swatch ${color === swatch.value ? 'selected' : ''}`} style={{ '--swatch': swatch.preview }} onClick={() => setColor(swatch.value)} aria-label={`Select ${swatch.value}`} />)}</div></div><div className="folder-picker"><p>Emoji</p><div className="emoji-picker">{icons.map((emoji) => <button key={emoji} type="button" className={`emoji-option ${icon === emoji ? 'selected' : ''}`} onClick={() => setIcon(emoji)} aria-label={`Select ${emoji}`}>{emoji}</button>)}</div></div><button className={`btn btn-orange ${isEditing ? 'btn-full' : 'primary-action'}`}>{isEditing ? 'Save Changes' : 'Create Stash'}</button></form></div>;
}

function DeleteFolderModal({ folder, close, deleteFolder }) {
  const itemCopy = folder.items.length === 1 ? '1 item' : `${folder.items.length} items`;
  return <div className="overlay" role="presentation"><section className="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-stash-title"><button className="close" type="button" onClick={close} aria-label="Close">×</button><h2 id="delete-stash-title">Delete stash?</h2><p><strong>{folder.name}</strong> and its {itemCopy} will be permanently removed.</p><div className="confirm-actions"><button className="btn btn-quiet" type="button" onClick={close}>Keep Stash</button><button className="btn btn-danger" type="button" onClick={() => deleteFolder(folder.id)}>Delete Stash</button></div></section></div>;
}

function ItemEditModal({ item, folder, folders, close, updateItem }) {
  const [colors, setColors] = useState(item.colors || []);
  const [selectedColor, setSelectedColor] = useState('');
  const [destinationFolderId, setDestinationFolderId] = useState(folder.id);
  const applyColor = (value, slotIndex = null) => {
    const color = value.toUpperCase();
    setSelectedColor(Number.isInteger(slotIndex) ? color : '');
    setColors((current) => {
      if (Number.isInteger(slotIndex) && current[slotIndex]) { const next = [...current]; next[slotIndex] = color; return next; }
      return current.includes(color) || current.length >= 3 ? current : [...current, color];
    });
  };
  const pickColor = async () => {
    const slotIndex = selectedColor && colors.includes(selectedColor) ? colors.indexOf(selectedColor) : null;
    if (!('EyeDropper' in window)) return;
    try { const { sRGBHex } = await new window.EyeDropper().open(); applyColor(sRGBHex, slotIndex); } catch {}
  };
  const removeColor = (color) => { setColors((current) => current.filter((entry) => entry !== color)); setSelectedColor(''); };
  const submit = (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); updateItem(destinationFolderId, item.id, { name: form.get('name').trim(), material: form.get('material').trim(), notes: form.get('notes').trim(), colors }); };
  return <div className="overlay"><form className="modal item-modal item-edit-modal" onSubmit={submit}><button className="close" type="button" onClick={close} aria-label="Close">×</button><h2>Edit item</h2><section className="item-step"><img className="details-thumbnail" src={item.src} alt="Item thumbnail" /><div className="details-primary-fields"><label><span className="field-label">Item name <span className="required-marker" aria-hidden="true">*</span></span><input className="field" name="name" required maxLength="60" defaultValue={item.name} autoFocus /></label><label>Material<input className="field" name="material" maxLength="60" defaultValue={item.material} /></label></div><label>Notes<textarea className="field textarea" name="notes" maxLength="250" defaultValue={item.notes} /></label><div className="colour-picker" aria-label="Item colours"><button className="eyedropper-btn" type="button" onClick={pickColor} disabled={!selectedColor && colors.length >= 3} aria-label={selectedColor ? `Change ${selectedColor}` : 'Add a colour from the item'} title={selectedColor ? `Change ${selectedColor}` : 'Add a colour from the item'}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.7 3.3 6 6-3 3-1.5-1.5-6.7 6.7-2.4.6.6-2.4 6.7-6.7-1.5-1.5 2.8-2.8ZM5.7 17.3l1 1-2.9 2.9a2 2 0 0 1-2.8-2.8l2.9-2.9 1 1 .8-.8Z" /></svg></button><div className="item-colours">{Array.from({ length: 3 }, (_, index) => { const color = colors[index]; const tone = color ? swatchTone(color) : ''; return color ? <button type="button" key={color} className={`item-colour-chip ${tone} ${selectedColor === color ? 'selected' : ''}`} style={{ '--chip': color, '--chip-text': contrastingTextColor(color) }} onClick={() => setSelectedColor((current) => current === color ? '' : color)} aria-pressed={selectedColor === color} aria-label={`${selectedColor === color ? 'Unselect' : 'Select'} ${color}`}><span>{color}</span><span className="swatch-remove" role="button" tabIndex="0" aria-label={`Delete ${color}`} onClick={(event) => { event.stopPropagation(); removeColor(color); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); removeColor(color); } }}>×</span></button> : <span key={`colour-slot-${index}`} className="item-colour-chip empty">Colour {index + 1}</span>; })}</div></div><label className="folder-select"><span>Choose Stash</span><select value={destinationFolderId} onChange={(event) => setDestinationFolderId(event.target.value)}>{folders.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.icon} {candidate.name}</option>)}</select></label><div className="step-actions"><button className="btn btn-quiet" type="button" onClick={close}>Back</button><button className="btn btn-orange" type="submit">Save Changes</button></div></section></form></div>;
}

function DeleteItemModal({ item, close, deleteItem }) {
  return <div className="overlay" role="presentation"><section className="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-item-title"><button className="close" type="button" onClick={close} aria-label="Close">×</button><h2 id="delete-item-title">Delete item?</h2><p><strong>{item.name}</strong> will be permanently removed from this stash.</p><div className="confirm-actions"><button className="btn btn-quiet" type="button" onClick={close}>Keep Item</button><button className="btn btn-danger" type="button" onClick={() => deleteItem(item.id)}>Delete Item</button></div></section></div>;
}

const readAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('The image could not be read.'));
  reader.readAsDataURL(file);
});

const drawImageOnCanvas = (canvas, src, isCurrent = () => true) => new Promise((resolve, reject) => {
  const newImg = new Image();
  newImg.onload = () => {
    if (!isCurrent()) { resolve(); return; }
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(newImg, 0, 0, canvas.width, canvas.height);
    resolve();
  };
  newImg.onerror = () => reject(new Error('The image preview could not be created.'));
  newImg.src = src;
});

const paintCrop = (canvas, src, zoom, rotation, position, isCurrent = () => true) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => {
    if (!isCurrent()) { resolve(null); return; }
    const size = 640;
    const context = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;
    const radians = rotation * Math.PI / 180;
    const rotationCover = Math.abs(Math.cos(radians)) + Math.abs(Math.sin(radians));
    const coverScale = Math.max(size / image.naturalWidth, size / image.naturalHeight) * rotationCover;
    const scale = coverScale * zoom;
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const rotatedWidth = Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians));
    const rotatedHeight = Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians));
    const maxX = Math.max(0, (rotatedWidth - size) / 2);
    const maxY = Math.max(0, (rotatedHeight - size) / 2);
    const x = Math.max(-maxX, Math.min(maxX, position.x));
    const y = Math.max(-maxY, Math.min(maxY, position.y));
    context.clearRect(0, 0, size, size);
    context.save();
    context.translate(size / 2 + x, size / 2 + y);
    context.rotate(radians);
    context.drawImage(image, -width / 2, -height / 2, width, height);
    context.restore();
    resolve({ x, y, maxX, maxY });
  };
  image.onerror = () => reject(new Error('The image preview could not be created.'));
  image.src = src;
});

function ItemModal({ folder, folders, isFolderSpecific, close, createItem }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [source, setSource] = useState('');
  const [prepared, setPrepared] = useState('');
  const [processed, setProcessed] = useState('');
  const [cropZoom, setCropZoom] = useState(1);
  const [cropRotation, setCropRotation] = useState(0);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [isPositioning, setIsPositioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removalCopy, setRemovalCopy] = useState({ title: 'Removing background...', detail: 'Finding the edge of your item' });
  const [step2CanvasReady, setStep2CanvasReady] = useState(false);
  const [brushFallback, setBrushFallback] = useState(false);
  const [removeError, setRemoveError] = useState('');
  const [colors, setColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [details, setDetails] = useState({ name: '', material: '', notes: '' });
  const [destinationFolderId, setDestinationFolderId] = useState(folder?.id || folders[0]?.id || '');
  const [sampling, setSampling] = useState(false);
  const [samplingSlot, setSamplingSlot] = useState(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const autoRemoveRef = useRef(false);
  const autoRemoveRunRef = useRef(0);
  const removalRunRef = useRef(0);
  const removalAbortRef = useRef(null);
  const removalTimerRef = useRef(null);
  const removalStartedAtRef = useRef(0);
  const canvasSizeRef = useRef({ width: 640, height: 640 });
  const brushPointRef = useRef(null);
  const brushingRef = useRef(false);
  const cropDragRef = useRef(null);
  const cropBoundsRef = useRef({ maxX: 0, maxY: 0 });
  const canvasImage = processed || prepared;

  useEffect(() => {
    if (!canvasRef.current || step === 3) return;
    let current = true;
    if (step === 1 && source) {
      paintCrop(canvasRef.current, source, cropZoom, cropRotation, cropPosition, () => current).then((crop) => {
        if (!crop) return;
        const { x, y, maxX, maxY } = crop;
        cropBoundsRef.current = { maxX, maxY };
        if (x !== cropPosition.x || y !== cropPosition.y) setCropPosition({ x, y });
      }).catch((error) => setRemoveError(error.message));
    } else if (step === 2 && canvasImage) {
      drawImageOnCanvas(canvasRef.current, canvasImage, () => current).then(() => {
        if (current) setStep2CanvasReady(true);
      }).catch((error) => setRemoveError(error.message));
    }
    return () => { current = false; };
  }, [canvasImage, cropPosition, cropRotation, cropZoom, source, step]);

  const acceptFile = async (nextFile) => {
    if (!nextFile) return;
    if (!nextFile.type.startsWith('image/')) {
      setRemoveError('Choose a PNG, JPG, WEBP, or another image file.');
      return;
    }
    try {
      const dataUrl = await readAsDataUrl(nextFile);
      setFile(nextFile);
      setSource(dataUrl);
      setPrepared('');
      setProcessed('');
      setCropZoom(1);
      setCropRotation(0);
      setCropPosition({ x: 0, y: 0 });
      setBrushFallback(false);
      setRemoveError('');
      setDetails({ name: '', material: '', notes: '' });
      setColors([]);
      setSelectedColor('');
      setStep(1);
    } catch (error) {
      setRemoveError(error.message);
    }
  };

  const upload = (event) => acceptFile(event.target.files?.[0]);
  const drop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  };

  const beginPositioning = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    cropDragRef.current = { x: event.clientX, y: event.clientY, origin: cropPosition };
    setIsPositioning(true);
  };

  const positionCrop = (event) => {
    if (!cropDragRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = canvasRef.current.width / rect.width;
    const { maxX, maxY } = cropBoundsRef.current;
    const nextX = cropDragRef.current.origin.x + (event.clientX - cropDragRef.current.x) * scale;
    const nextY = cropDragRef.current.origin.y + (event.clientY - cropDragRef.current.y) * scale;
    setCropPosition({
      x: Math.max(-maxX, Math.min(maxX, nextX)),
      y: Math.max(-maxY, Math.min(maxY, nextY)),
    });
  };

  const finishPositioning = () => {
    cropDragRef.current = null;
    setIsPositioning(false);
  };

  const cancelRemoval = () => {
    removalRunRef.current += 1;
    autoRemoveRef.current = false;
    removalAbortRef.current?.abort();
    removalAbortRef.current = null;
    window.clearTimeout(removalTimerRef.current);
    removalTimerRef.current = null;
    setIsRemoving(false);
  };

  const advanceToRemoval = () => {
    canvasSizeRef.current = { width: canvasRef.current.width, height: canvasRef.current.height };
    setPrepared(canvasRef.current.toDataURL('image/png'));
    setProcessed('');
    setStep2CanvasReady(false);
    setBrushFallback(false);
    setRemoveError('');
    setRemovalCopy({ title: 'Removing background...', detail: 'Finding the edge of your item' });
    setIsRemoving(true);
    removalStartedAtRef.current = Date.now();
    autoRemoveRunRef.current = ++removalRunRef.current;
    autoRemoveRef.current = true;
    setStep(2);
  };

  const returnToPhotoUpload = () => {
    setFile(null);
    setSource('');
    setPrepared('');
    setProcessed('');
    setCropZoom(1);
    setCropRotation(0);
    setCropPosition({ x: 0, y: 0 });
    setBrushFallback(false);
    setRemoveError('');
  };

  const removeBackground = async (imageBlob, runId) => {
    if (!imageBlob || runId !== removalRunRef.current) return;
    const isCurrentRun = () => runId === removalRunRef.current;
    const abortController = new AbortController();
    removalAbortRef.current = abortController;
    setIsRemoving(true);
    setBrushFallback(false);
    setRemoveError('');
    setRemovalCopy({ title: 'Removing background...', detail: 'Finding the edge of your item' });
    const showAlmostThere = () => {
      if (isCurrentRun() && Date.now() - removalStartedAtRef.current >= 650) setRemovalCopy({ title: 'Almost there...', detail: 'Polishing the final edge' });
    };
    removalTimerRef.current = window.setTimeout(() => {
      showAlmostThere();
    }, 1100);
    try {
      let result;
      const endpoint = import.meta.env.VITE_BG_REMOVAL_ENDPOINT;
      if (endpoint) {
        const body = new FormData();
        body.append('image', imageBlob, `${file?.name.replace(/\.[^.]+$/, '') || 'stash-item'}-square.png`);
        body.append('size', 'full');
        body.append('crop', 'false');
        const response = await fetch(endpoint, { method: 'POST', body, signal: abortController.signal });
        if (!response.ok) throw new Error(`Background removal failed (${response.status}).`);
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          result = data.image || data.result || data.url;
          if (!result) throw new Error('The background-removal response did not include an image.');
        } else {
          result = await readAsDataUrl(await response.blob());
        }
      } else {
        const transparentBlob = await imglyRemoveBackground(imageBlob, {
          device: 'cpu',
          model: 'isnet_quint8',
          output: { format: 'image/png', quality: 1, type: 'foreground' },
          fetchArgs: { signal: abortController.signal },
          progress: (stage, current, total) => {
            if (stage.includes('mask') || stage.includes('encode') || current / total >= 0.75) showAlmostThere();
          },
        });
        result = await readAsDataUrl(transparentBlob);
      }
      if (!isCurrentRun()) return;
      await drawImageOnCanvas(canvasRef.current, result);
      if (!isCurrentRun()) return;
      setProcessed(result);
      window.clearTimeout(removalTimerRef.current);
      const remainingStartCopyTime = Math.max(0, 650 - (Date.now() - removalStartedAtRef.current));
      if (remainingStartCopyTime) await new Promise((resolve) => window.setTimeout(resolve, remainingStartCopyTime));
      if (!isCurrentRun()) return;
      setRemovalCopy({ title: 'Successfully cropped', detail: 'Your cutout is ready' });
      await new Promise((resolve) => window.setTimeout(resolve, 650));
    } catch (error) {
      if (!isCurrentRun() || error.name === 'AbortError') return;
      window.clearTimeout(removalTimerRef.current);
      setRemoveError('Background removal failed (404). Try again or use the refine brush.');
      setBrushFallback(true);
    } finally {
      if (isCurrentRun()) {
        window.clearTimeout(removalTimerRef.current);
        removalTimerRef.current = null;
        removalAbortRef.current = null;
        setIsRemoving(false);
      }
    }
  };

  useEffect(() => {
    if (!autoRemoveRef.current || step !== 2 || !prepared || !step2CanvasReady) return;
    autoRemoveRef.current = false;
    const runId = autoRemoveRunRef.current;
    void (async () => {
      try {
        const imageBlob = await (await fetch(prepared)).blob();
        await removeBackground(imageBlob, runId);
      } catch {
        if (runId !== removalRunRef.current) return;
        setRemoveError('Background removal failed (404). Try again or use the refine brush.');
        setBrushFallback(true);
        setIsRemoving(false);
      }
    })();
  }, [prepared, step, step2CanvasReady]);

  const eraseFallback = (event) => {
    if (!brushFallback || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const point = { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
    const previous = brushPointRef.current || point;
    const context = canvas.getContext('2d');
    context.save();
    context.globalCompositeOperation = 'destination-out';
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 42 * canvas.width / rect.width;
    context.beginPath();
    context.moveTo(previous.x, previous.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    context.restore();
    brushPointRef.current = point;
  };

  const beginFallbackBrush = (event) => {
    if (!brushFallback) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    brushingRef.current = true;
    brushPointRef.current = null;
    eraseFallback(event);
  };

  const finishFallbackBrush = () => {
    if (!brushingRef.current) return;
    brushingRef.current = false;
    brushPointRef.current = null;
    setProcessed(canvasRef.current.toDataURL('image/png'));
  };

  const useCanvasImage = () => {
    setStep(3);
  };

  const applyColor = (value, slotIndex = null) => {
    const colour = value.toUpperCase();
    setSelectedColor(Number.isInteger(slotIndex) ? colour : '');
    setColors((current) => {
      if (Number.isInteger(slotIndex) && current[slotIndex]) {
        const next = [...current];
        next[slotIndex] = colour;
        return next;
      }
      return current.includes(colour) || current.length >= 3 ? current : [...current, colour];
    });
  };
  const pickColor = async () => {
    const slotIndex = selectedColor && colors.includes(selectedColor) ? colors.indexOf(selectedColor) : null;
    if ('EyeDropper' in window) {
      try { const { sRGBHex } = await new window.EyeDropper().open(); applyColor(sRGBHex, slotIndex); } catch {}
    } else {
      setSamplingSlot(slotIndex);
      setSampling(true);
    }
  };
  const samplePreview = (event) => {
    if (!sampling) return;
    const image = event.currentTarget;
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const rect = image.getBoundingClientRect();
    const x = Math.min(canvas.width - 1, Math.max(0, Math.floor((event.clientX - rect.left) * canvas.width / rect.width)));
    const y = Math.min(canvas.height - 1, Math.max(0, Math.floor((event.clientY - rect.top) * canvas.height / rect.height)));
    const [red, green, blue] = context.getImageData(x, y, 1, 1).data;
    applyColor(`#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`, samplingSlot);
    setSampling(false);
    setSamplingSlot(null);
  };
  const removeColor = (color) => {
    setColors((current) => current.filter((entry) => entry !== color));
    setSelectedColor('');
  };
  const submit = (event) => {
    event.preventDefault();
    if (!processed) return;
    createItem(destinationFolderId, { name: details.name.trim(), material: details.material.trim(), notes: details.notes.trim(), src: processed, colors });
  };

  return <div className="overlay"><form className="modal item-modal" onSubmit={submit}>
    <button className="close" type="button" onClick={() => { cancelRemoval(); close(); }} aria-label="Close">×</button>
    <h2>Add Item</h2>
    {isFolderSpecific && destinationFolderId === folder.id && <p className="modal-subtitle">Saving to <strong>{folder.name}</strong></p>}
    <ol className="item-stepper" aria-label="Add item steps">{['Photo', 'Remove background', 'Details'].map((label, index) => <li key={label} className={`${step === index + 1 ? 'active' : step > index + 1 ? 'complete' : ''} ${isRemoving && index === 1 ? 'loading' : ''}`}><span>{index + 1}</span>{label}</li>)}</ol>

    {step === 1 && <section className="item-step">
      {!source && <div className={`upload-zone ${isDragging ? 'dragging' : ''}`} onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setIsDragging(false)} onDrop={drop}>
        <strong>{isDragging ? 'Drop it here' : 'Drop a packaging photo here'}</strong>
        <span className="upload-tip">(Best with plain background)</span>
        <input className="file-input" ref={fileInputRef} type="file" onChange={upload} accept="image/*" tabIndex="-1" aria-hidden="true" />
        <button className="upload-file-button" type="button" onClick={() => fileInputRef.current?.click()}>Choose file</button>
      </div>}
      {source && <div className="crop-workspace">
        <div className="crop-canvas-wrap">
          <canvas className={`preview-canvas ${isPositioning ? 'is-positioning' : ''}`} ref={canvasRef} role="img" aria-label="Square image crop. Drag to reposition." onPointerDown={beginPositioning} onPointerMove={positionCrop} onPointerUp={finishPositioning} onPointerCancel={finishPositioning} />
          <span className="crop-hint">Drag to position</span>
        </div>
        <label className="image-adjust-control"><span>Zoom <output>{Math.round(cropZoom * 100)}%</output></span><div className="image-adjust-range" style={{ '--range-fill': `${(cropZoom - 0.5) * 100}%` }}><input type="range" min="0.5" max="1.5" step="0.01" value={cropZoom} onChange={(event) => { const zoom = Number(event.target.value); setCropZoom(Math.abs(zoom - 1) < 0.05 ? 1 : zoom); }} aria-label="Zoom image" /><i aria-hidden="true" /></div></label>
        <label className="image-adjust-control"><span>Rotate <output>{cropRotation}°</output></span><div className="image-adjust-range" style={{ '--range-fill': `${(cropRotation + 180) / 3.6}%` }}><input type="range" min="-180" max="180" step="1" value={cropRotation} onChange={(event) => { const rotation = Number(event.target.value); setCropRotation(Math.abs(rotation) < 4 ? 0 : rotation); }} aria-label="Rotate image" /><i aria-hidden="true" /></div></label>
        <button className="reset-crop" type="button" onClick={() => { setCropZoom(1); setCropRotation(0); setCropPosition({ x: 0, y: 0 }); }}>Reset position</button>
      </div>}
      {removeError && <p className="step-error" role="alert">{removeError}</p>}
      {source ? <div className="step-actions"><button className="btn btn-quiet" type="button" onClick={returnToPhotoUpload}>Back</button><button className="btn btn-orange" type="button" onClick={advanceToRemoval}>Next</button></div> : <button className="btn btn-orange btn-full" type="button" disabled onClick={advanceToRemoval}>Next</button>}
    </section>}

    {step === 2 && <section className="item-step">
      <div className="image-workspace">
        <div className="canvas-wrap">
          <canvas className={`eraser-canvas ${brushFallback ? 'is-fallback' : ''}`} ref={canvasRef} width={canvasSizeRef.current.width} height={canvasSizeRef.current.height} role="img" aria-label={brushFallback ? 'Refine brush canvas. Drag to erase the background.' : 'Background removal preview'} onPointerDown={beginFallbackBrush} onPointerMove={(event) => brushingRef.current && eraseFallback(event)} onPointerUp={finishFallbackBrush} onPointerCancel={finishFallbackBrush} />
          {isRemoving && <div className={`canvas-loading ${removalCopy.title === 'Successfully cropped' ? 'is-success' : ''}`} role="status" aria-live="polite">{removalCopy.title === 'Successfully cropped' ? <span className="success-mark" aria-hidden="true">✓</span> : <span className="spinner" />}<strong>{removalCopy.title}</strong><small>{removalCopy.detail}</small></div>}
        </div>
      </div>
      {removeError && <p className="step-error" role="alert">{removeError}</p>}
      <div className="step-actions"><button className="btn btn-quiet" type="button" onClick={() => { cancelRemoval(); setStep(1); }}>Back</button><button className="btn btn-orange" type="button" disabled={!processed || isRemoving} onClick={useCanvasImage}>Next</button></div>
    </section>}

    {step === 3 && <section className="item-step"><img className={`details-thumbnail ${sampling ? 'is-sampling' : ''}`} src={processed} alt="Prepared item thumbnail" onClick={samplePreview} /><div className="details-primary-fields"><label><span className="field-label">Item name <span className="required-marker" aria-hidden="true">*</span></span><input className="field" name="name" required maxLength="60" placeholder="e.g. Colourful Poster" value={details.name} onChange={(event) => setDetails((current) => ({ ...current, name: event.target.value }))} autoFocus /></label><label>Material<input className="field" name="material" maxLength="60" placeholder="e.g. Plastic, paper" value={details.material} onChange={(event) => setDetails((current) => ({ ...current, material: event.target.value }))} /></label></div><label>Notes<textarea className="field textarea" name="notes" maxLength="250" placeholder="What catches your eye?" value={details.notes} onChange={(event) => setDetails((current) => ({ ...current, notes: event.target.value }))} /></label><div className="colour-picker" aria-label="Item colours"><button className="eyedropper-btn" type="button" onClick={pickColor} disabled={!selectedColor && colors.length >= 3} aria-label={selectedColor ? `Change ${selectedColor}` : 'Add a colour from the item'} title={selectedColor ? `Change ${selectedColor}` : 'Add a colour from the item'}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.7 3.3 6 6-3 3-1.5-1.5-6.7 6.7-2.4.6.6-2.4 6.7-6.7-1.5-1.5 2.8-2.8ZM5.7 17.3l1 1-2.9 2.9a2 2 0 0 1-2.8-2.8l2.9-2.9 1 1 .8-.8Z" /></svg></button><div className="item-colours">{Array.from({ length: 3 }, (_, index) => { const color = colors[index]; const tone = color ? swatchTone(color) : ''; return color ? <button type="button" key={color} className={`item-colour-chip ${tone} ${selectedColor === color ? 'selected' : ''}`} style={{ '--chip': color, '--chip-text': contrastingTextColor(color) }} onClick={() => setSelectedColor((current) => current === color ? '' : color)} aria-pressed={selectedColor === color} aria-label={`${selectedColor === color ? 'Unselect' : 'Select'} ${color}`}><span>{color}</span><span className="swatch-remove" role="button" tabIndex="0" aria-label={`Delete ${color}`} onClick={(event) => { event.stopPropagation(); removeColor(color); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); removeColor(color); } }}>×</span></button> : <span key={`colour-slot-${index}`} className="item-colour-chip empty">Colour {index + 1}</span>; })}</div></div><label className="folder-select"><span>Choose Stash</span><select value={destinationFolderId} onChange={(event) => setDestinationFolderId(event.target.value)}>{folders.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.icon} {candidate.name}</option>)}</select></label>{sampling && <p className="colour-sampling-help">Click the item to sample a colour.</p>}<div className="step-actions"><button className="btn btn-quiet" type="button" onClick={() => setStep(2)}>Back</button><button className="btn btn-orange" type="submit">Save Item</button></div></section>}
  </form></div>;
}

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [folders, setFolders] = useState(() => { try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch { return []; } });
  const [page, setPage] = useState('home'); const [folderId, setFolderId] = useState(''); const [itemId, setItemId] = useState(''); const [search, setSearch] = useState(''); const [modal, setModal] = useState(''); const [itemFolderSpecific, setItemFolderSpecific] = useState(false);
  useEffect(() => localStorage.setItem(storageKey, JSON.stringify(folders)), [folders]);
  const folder = findFolder(folders, folderId) || folders[0]; const item = folder?.items.find((entry) => entry.id === itemId) || folder?.items[0];
  const openFolder = (id) => { setFolderId(id); setSearch(''); setPage('collection'); };
  const openItem = (nextFolderId, nextItemId) => { setFolderId(nextFolderId); setItemId(nextItemId); setSearch(''); setPage('detail'); };
  const createFolder = ({ name, description, color, icon }) => { const entry = { id: `folder-${Date.now()}`, name, description, color, icon, items: [] }; setFolders((current) => [...current, entry]); setFolderId(entry.id); setModal(''); setPage('collection'); };
  const updateFolder = (id, details) => { setFolders((current) => current.map((candidate) => candidate.id === id ? { ...candidate, ...details } : candidate)); setModal(''); };
  const openItemModal = (isFolderSpecific) => { setItemFolderSpecific(isFolderSpecific); setModal('item'); };
  const createItem = (destinationFolderId, entry) => { const withId = { ...entry, id: `item-${Date.now()}` }; setFolders((current) => current.map((candidate) => candidate.id === destinationFolderId ? { ...candidate, items: [withId, ...candidate.items] } : candidate)); setFolderId(destinationFolderId); setItemId(withId.id); setModal(''); setPage('detail'); };
  const updateItem = (destinationFolderId, id, details) => {
    const updatedItem = { ...item, ...details };
    setFolders((current) => current.map((candidate) => {
      if (candidate.id === folder.id && candidate.id === destinationFolderId) return { ...candidate, items: candidate.items.map((entry) => entry.id === id ? updatedItem : entry) };
      if (candidate.id === folder.id) return { ...candidate, items: candidate.items.filter((entry) => entry.id !== id) };
      if (candidate.id === destinationFolderId) return { ...candidate, items: [updatedItem, ...candidate.items] };
      return candidate;
    }));
    setFolderId(destinationFolderId);
    setItemId(id);
    setModal('');
  };
  const deleteFolder = (id) => { setFolders((current) => current.filter((candidate) => candidate.id !== id)); setModal(''); setSearch(''); setPage('home'); };
  const deleteItem = (id) => { setFolders((current) => current.map((candidate) => candidate.id === folder.id ? { ...candidate, items: candidate.items.filter((entry) => entry.id !== id) } : candidate)); setModal(''); setPage('collection'); };
  if (!hasEntered) return <Landing onEnter={() => setHasEntered(true)} />;
  return <><GridWarpFilter />{page === 'collection' ? <Collection folder={folder} onBack={() => setPage('home')} openItem={openItem} openItemModal={() => openItemModal(true)} openEditModal={() => setModal('edit-folder')} openDeleteModal={() => setModal('delete-folder')} /> : page === 'detail' && item ? <Detail folder={folder} item={item} onBack={() => setPage('collection')} openEditItemModal={() => setModal('edit-item')} openDeleteItemModal={() => setModal('delete-item')} /> : <Home folders={folders} search={search} setSearch={setSearch} openFolder={openFolder} openItem={openItem} openFolderModal={() => setModal('folder')} openItemModal={() => openItemModal(false)} />}{modal === 'folder' && <FolderModal close={() => setModal('')} createFolder={createFolder} />}{modal === 'edit-folder' && folder && <FolderModal close={() => setModal('')} folder={folder} updateFolder={updateFolder} />}{modal === 'item' && <ItemModal folder={folder} folders={folders} isFolderSpecific={itemFolderSpecific} close={() => setModal('')} createItem={createItem} />}{modal === 'edit-item' && item && <ItemEditModal item={item} folder={folder} folders={folders} close={() => setModal('')} updateItem={updateItem} />}{modal === 'delete-folder' && folder && <DeleteFolderModal folder={folder} close={() => setModal('')} deleteFolder={deleteFolder} />}{modal === 'delete-item' && item && <DeleteItemModal item={item} close={() => setModal('')} deleteItem={deleteItem} />}</>;
}
