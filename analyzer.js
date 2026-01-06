const fs = require('fs').promises;

/**
 * Reads and parses follower data from followers_1.json
 * @returns {Promise<Map<string, number>>} Map of username to timestamp
 */
async function readFollowers() {
  const data = await fs.readFile('followers_1.json', 'utf-8');
  const followers = JSON.parse(data);

  const followerMap = new Map();

  for (const item of followers) {
    if (item.string_list_data && item.string_list_data[0]) {
      const username = item.string_list_data[0].value;
      const timestamp = item.string_list_data[0].timestamp;
      followerMap.set(username, timestamp);
    }
  }

  return followerMap;
}

/**
 * Reads and parses following data from following.json
 * @returns {Promise<Map<string, number>>} Map of username to timestamp
 */
async function readFollowing() {
  const data = await fs.readFile('following.json', 'utf-8');
  const json = JSON.parse(data);

  const followingMap = new Map();

  if (json.relationships_following) {
    for (const item of json.relationships_following) {
      const username = item.title;
      const timestamp = item.string_list_data && item.string_list_data[0]
        ? item.string_list_data[0].timestamp
        : null;

      if (username) {
        followingMap.set(username, timestamp);
      }
    }
  }

  return followingMap;
}

/**
 * Analyzes Instagram follower/following relationships
 * @returns {Promise<Array>} Array of users with their timestamps
 */
async function analyzeRelationships() {
  const [followersMap, followingMap] = await Promise.all([
    readFollowers(),
    readFollowing()
  ]);

  // Combine all unique users
  const allUsernames = new Set([...followersMap.keys(), ...followingMap.keys()]);

  // Create array with user timestamps
  const users = [];
  for (const username of allUsernames) {
    users.push({
      username,
      followed_you_at: followersMap.get(username) || null,
      you_followed_at: followingMap.get(username) || null
    });
  }

  // Sort by followed_you_at (most recent first), then by you_followed_at
  users.sort((a, b) => {
    const aFollowed = a.followed_you_at || 0;
    const bFollowed = b.followed_you_at || 0;
    if (aFollowed !== bFollowed) return bFollowed - aFollowed;
    return (b.you_followed_at || 0) - (a.you_followed_at || 0);
  });

  return users;
}

/**
 * Main execution function
 */
async function main() {
  try {
    const startTime = Date.now();
    const users = await analyzeRelationships();
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // Calculate stats for logging
    const mutuals = users.filter(u => u.followed_you_at && u.you_followed_at).length;
    const fans = users.filter(u => u.followed_you_at && !u.you_followed_at).length;
    const notFollowingBack = users.filter(u => !u.followed_you_at && u.you_followed_at).length;

    console.log(`✓ Analysis complete (${executionTime}s)`);
    console.log(`  Total users: ${users.length} | Mutual: ${mutuals} | Fans: ${fans} | Not Following Back: ${notFollowingBack}`);

    await fs.writeFile('analysis_results.json', JSON.stringify(users, null, 2), 'utf-8');
    console.log(`✓ Results saved to analysis_results.json`);

    return users;

  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

// Export functions for use as module
module.exports = {
  analyzeRelationships,
  readFollowers,
  readFollowing,
  main
};

// Run if called directly
if (require.main === module) {
  main();
}
