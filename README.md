# Unfollowers

A web-based tool to identify Instagram accounts that don't follow you back.

## Overview

This project analyzes your Instagram data (exported JSON files from Instagram) to find accounts you follow that aren't following you back. Features an interactive web interface for easy data upload and visualization.

## How It Works

1. Export your Instagram data from the official Instagram app/website
2. Extract the `followers.json` and `following.json` files
3. Upload the files through the web interface
4. View detailed statistics and unfollowers list

## Features

- 🌐 Interactive web interface
- 📊 Parse Instagram exported JSON data
- 🔍 Identify accounts not following back
- 📈 Comprehensive follower/following statistics
- 📝 Display results in a clean, sortable format

## Statistics Dashboard

The tool provides detailed insights into your Instagram network:

### Overview Metrics
- **Total Followers** - Number of accounts following you
- **Total Following** - Number of accounts you follow
- **Follow Ratio** - Following/Followers percentage
- **Mutual Connections** - Accounts that follow you and you follow back
- **Unfollowers Count** - Accounts you follow that don't follow back
- **Fans Count** - Accounts following you that you don't follow back

### Engagement Insights
- **Follow Back Rate** - Percentage of accounts you follow that follow you back
- **Reciprocity Score** - Ratio of mutual follows vs. one-sided relationships
- **Network Balance** - Visual indicator of following symmetry

### Account Analysis
- **Most Recent Follows** - Latest accounts you started following
- **Oldest Follows** - Accounts you've followed the longest
- **Follow Date Ranges** - Timeline of your following activity
- **Follow back time rate** - Average time between following an account and them following back

## Planned Features

- 📈 Track changes over time (compare multiple exports)
- 💾 Export filtered lists to CSV/TXT
- 🎯 Search and filter functionality
- 📊 Visual charts and graphs
- 🌓 Dark/light theme toggle

## Usage

Simply open the web interface and drag-and-drop your `followers.json` and `following.json` files, or use the file picker to select them.

## Requirements

- Instagram data export (JSON format)

## License

MIT
