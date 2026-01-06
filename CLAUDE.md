# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Instagram follower/following relationship analyzer that processes exported Instagram JSON data to identify mutual followers, fans, and accounts not following back. Built with Node.js for the core analysis engine, with a planned web interface.

## Commands

```bash
# Run analysis on Instagram data files
npm run analyze
# or
node analyzer.js

# The script expects followers_1.json and following.json in the root directory
```

## Architecture

### Core Analysis Engine (`analyzer.js`)

The analyzer is the foundation that all future features (web interface, charts, tracking) will build upon. It:

1. **Reads Instagram export data** from two different JSON structures:
   - `followers_1.json`: Array format, usernames at `string_list_data[0].value`
   - `following.json`: Object format with `relationships_following` array, usernames at `title` field

2. **Uses Set-based operations** for O(1) performance:
   - Creates `Map<username, timestamp>` for both datasets
   - Merges followers and following maps into unified user collection
   - Handles large datasets (tested with 798 followers, 1048 following) in ~0.01s

3. **Returns unified user data structure**:
   - Each user appears exactly once with both timestamps
   - Category determination via timestamp presence:
     - **mutual**: both `followed_you_at` and `you_followed_at` present
     - **fans**: only `followed_you_at` present
     - **not_following_back**: only `you_followed_at` present

4. **Exports modular functions** for reuse:
   - `analyzeRelationships()` - Main analysis function
   - `readFollowers()` - Parse followers data
   - `readFollowing()` - Parse following data
   - All functions return Promises for async composition

### Output Structure

`analysis_results.json` is an array of user objects:
```javascriptnames with `followed_you_at` and `you_followed_at`
[
  {
    "username": "user1",
    "followed_you_at": 1766303220,      // null if user doesn't follow you
    "you_followed_at": 1766317802       // null if you don't follow user
  },
  {
    "username": "user2",
    "followed_you_at": null,
    "you_followed_at": 1764531324
  }
]
```

Array sorted by `followed_you_at` (most recent first), then by `you_followed_at`.

## Development Guidelines

### Preferences

- Keep logs minimal and essential only; Avoid verbose console output

- Future Integration:
   - Web interface will import `analyzer.js` as a module
   - Dashboard can filter results by timestamp presence (null/non-null) to determine categories
   - Charts/visualizations will consume returned data from `analyzer.js`
