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
   - Performs set difference operations to categorize users
   - Handles large datasets (tested with 798 followers, 1048 following) in ~0.01s

3. **Categorizes relationships**:
   - **not_following_back**: `following_set - followers_set`
   - **fans**: `followers_set - following_set`
   - **mutual**: `followers_set ∩ following_set`

4. **Calculates follow back time**:
   - `follow_back_time = they_followed_at - you_followed_at`
   - Positive value: they followed after you (you followed first)
   - Negative value: you followed after them (they followed first)
   - Only meaningful for mutual followers

5. **Exports modular functions** for reuse:
   - `analyzeRelationships()` - Main analysis function
   - `readFollowers()` - Parse followers data
   - `readFollowing()` - Parse following data
   - All functions return Promises for async composition

### Output Structure

`analysis_results.json` contains:
```javascript
{
  data: {
    not_following_back: [{username, you_followed_at, you_followed_at_date}],
    fans: [{username, they_followed_at, they_followed_at_date}],
    mutual: [{
      username,
      you_followed_at,
      they_followed_at,
      follow_back_time_seconds,
      follow_back_time_days,
      who_followed_first  // 'you' | 'them'
    }]
  },
  totals: {followers, following, mutual, not_following_back, fans},
  rates: {mutual_rate, follow_back_rate},
  execution_time_seconds
}
```

All arrays are sorted by timestamp (most recent first).

## Development Guidelines

### Preferences

- Before implementing features, display technical decisions regarding data structure and algorithm choices; Present the approach for user approval before writing code
- Keep logs minimal and essential only; Avoid verbose console output

- Future Integration:
   - Web interface will import `analyzer.js` as a module
   - Charts/visualizations will consume returned data from `analyzer.js` (`analysis_results.json` will not be generated)
   - Time tracking features will use the `follow_back_time_*` fields
