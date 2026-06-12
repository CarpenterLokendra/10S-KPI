# Profile Picture Debug Guide

## 🔍 What I've Added for Debugging

I've added comprehensive logging to help identify why profile pictures aren't showing. Here's what to check:

---

## 📋 Console Logs to Monitor

### 1. **Initial Player Data** (When game loads)
```
👥 ALL PLAYERS DATA: [
  { id: '...', username: 'Alice', avatar_url: 'https://...', has_avatar_url: true, isBot: false },
  { id: '...', username: 'Bob (Bot-...)', avatar_url: null/undefined, has_avatar_url: false, isBot: true }
]
```
**What to look for:** 
- Check if `avatar_url` is `null`, `undefined`, or empty string
- Check if `has_avatar_url` is `true` for human players

### 2. **WebSocket Initial Fetch** (When game state first received)
```
✅ Restoring players: [...]
   Player avatars (initial fetch): [
     { id: '...', username: 'Alice', avatar_url: 'https://...', has_avatar_url: true, isBot: false }
   ]
```
**What to look for:**
- Same as above - are avatars coming from backend?

### 3. **Game State Updates** (During gameplay)
```
✅ Calling setPlayers with: [...]
   Player avatars: [
     { id: '...', username: 'Alice', avatar_url: 'https://...', has_avatar_url: true, isBot: false }
   ]
```
**What to look for:**
- Do avatar URLs stay consistent during game?

### 4. **Mobile Player Card Render**
```
🎨 MobilePlayerCard render: {
  playerId: '...',
  username: 'Alice',
  avatar_url: 'https://...',
  hasAvatar: true,
  imageErrorsSet: Set(0) {},
  hasImageError: false,
  shouldShow: true,
}
```
**What to look for:**
- `shouldShow: true` means the `<img>` tag should render
- `shouldShow: false` means initials will show instead

---

## 🧪 Testing Steps

1. **Start the game** and look at browser console (F12)
2. **Check the logs above** to see where the problem is
3. **Look for the pattern:**

### Pattern A: Avatar URLs are NULL/UNDEFINED
```
avatar_url: null
has_avatar_url: false
```
**Problem:** Backend is not sending avatar URLs
**Solution:** Need to fix backend serialization

### Pattern B: Avatar URLs are present BUT showing nothing
```
avatar_url: 'https://...'
shouldShow: true
```
But image doesn't render
**Problem:** Image loading failed, broken URL, or CSS issue
**Solution:** Check if image onError callback is working, verify URL is valid

### Pattern C: Initials showing instead of pictures
```
shouldShow: false
```
**Problem:** Avatar URL is missing or image failed
**Solution:** Check Pattern A or B above

---

## 🔧 What I've Fixed So Far

1. ✅ Added image error handling with `onError` callback
2. ✅ Track failed images in state
3. ✅ Fallback to initials when image fails
4. ✅ Added comprehensive logging at multiple points

---

## 📝 Next Steps (After You Check Logs)

Once you run the game and check the console:

1. **If avatar_url is NULL:**
   - Backend issue - player table might not have avatar_url populated
   - Or API response doesn't include the field

2. **If avatar_url exists but image doesn't show:**
   - Check if URL is valid (copy paste it in browser)
   - Check browser Network tab for image loading
   - Verify CORS headers if URL is from external CDN
   - Check CSS - might be hidden or have 0 size

3. **If initials show but should show pictures:**
   - Image is failing to load
   - Check Network tab → find the image request → see the error
   - Might be 404, CORS, or invalid URL

---

## 🚀 How to Capture Console Logs

1. Open browser DevTools (F12)
2. Go to Console tab
3. Start/join a quick match game
4. Copy the logs that match patterns above
5. Share them so I can identify the exact issue

---

## 💡 Most Likely Culprits

Based on the code review:

1. **Avatar URL is null for bot players** (most likely)
   - Backend might not populate avatar_url for bot-created players
   
2. **Avatar URL is null for everyone**
   - User profile doesn't have avatar
   - Backend not including field in response
   
3. **Avatar URL exists but path is wrong**
   - Relative URL instead of absolute
   - Wrong domain
   - Path doesn't exist on server

---

**Run the game NOW and check the console, then report what logs you see!** 🔍
