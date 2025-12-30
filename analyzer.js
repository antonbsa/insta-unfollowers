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
 * @returns {Promise<Object>} Analysis results with categorized users and statistics
 */
async function analyzeRelationships() {
  const [followersMap, followingMap] = await Promise.all([
    readFollowers(),
    readFollowing()
  ]);

  // Create sets for efficient operations
  const followersSet = new Set(followersMap.keys());
  const followingSet = new Set(followingMap.keys());

  // Categorize users
  const notFollowingBack = [];
  const fans = [];
  const mutual = [];

  // Not following back: people you follow but don't follow you
  for (const username of followingSet) {
    if (!followersSet.has(username)) {
      notFollowingBack.push({
        username,
        you_followed_at: followingMap.get(username),
        you_followed_at_date: new Date(followingMap.get(username) * 1000).toISOString()
      });
    }
  }

  // Fans: people who follow you but you don't follow
  for (const username of followersSet) {
    if (!followingSet.has(username)) {
      fans.push({
        username,
        they_followed_at: followersMap.get(username),
        they_followed_at_date: new Date(followersMap.get(username) * 1000).toISOString()
      });
    }
  }

  // Mutual: people who follow each other
  for (const username of followersSet) {
    if (followingSet.has(username)) {
      const youFollowedAt = followingMap.get(username);
      const theyFollowedAt = followersMap.get(username);

      // Calculate follow back time (in seconds)
      // Positive: they followed back after you followed them
      // Negative: you followed them after they followed you
      const followBackTime = theyFollowedAt - youFollowedAt;

      mutual.push({
        username,
        you_followed_at: youFollowedAt,
        they_followed_at: theyFollowedAt,
        you_followed_at_date: new Date(youFollowedAt * 1000).toISOString(),
        they_followed_at_date: new Date(theyFollowedAt * 1000).toISOString(),
        follow_back_time_seconds: followBackTime,
        follow_back_time_days: (followBackTime / 86400).toFixed(2),
        who_followed_first: followBackTime > 0 ? 'you' : 'them'
      });
    }
  }

  // Sort by timestamp (most recent first)
  notFollowingBack.sort((a, b) => b.you_followed_at - a.you_followed_at);
  fans.sort((a, b) => b.they_followed_at - a.they_followed_at);
  mutual.sort((a, b) => b.they_followed_at - a.they_followed_at);

  // Calculate totals
  const totals = {
    followers: followersMap.size,
    following: followingMap.size,
    not_following_back: notFollowingBack.length,
    fans: fans.length,
    mutual: mutual.length
  };

  // Calculate rates
  const mutualRate = totals.mutual / totals.followers * 100;
  const followBackRate = totals.mutual / totals.following * 100;

  const rates = {
    mutual_rate: mutualRate.toFixed(2) + '%',
    mutual_rate_value: parseFloat(mutualRate.toFixed(2)),
    follow_back_rate: followBackRate.toFixed(2) + '%',
    follow_back_rate_value: parseFloat(followBackRate.toFixed(2))
  };

  return {
    data: {
      not_following_back: notFollowingBack,
      fans: fans,
      mutual: mutual
    },
    totals,
    rates,
    summary: {
      description: 'Instagram Follower Analysis',
      interpretation: {
        not_following_back: 'People you follow who don\'t follow you back',
        fans: 'People who follow you but you don\'t follow back',
        mutual: 'People who follow each other',
        follow_back_rate: 'Percentage of people you follow who follow you back',
        mutual_rate: 'Percentage of your followers who you follow back'
      }
    }
  };
}

/**
 * Main execution function
 */
async function main() {
  try {
    const startTime = Date.now();
    const results = await analyzeRelationships();
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

    results.execution_time_seconds = parseFloat(executionTime);

    console.log(`✓ Analysis complete (${executionTime}s)`);
    console.log(`  Followers: ${results.totals.followers} | Following: ${results.totals.following} | Mutual: ${results.totals.mutual}`);
    console.log(`  Not Following Back: ${results.totals.not_following_back} | Fans: ${results.totals.fans}`);
    console.log(`  Follow Back Rate: ${results.rates.follow_back_rate} | Mutual Rate: ${results.rates.mutual_rate}`);

    await fs.writeFile('analysis_results.json', JSON.stringify(results, null, 2), 'utf-8');
    console.log(`✓ Results saved to analysis_results.json`);

    return results;

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
