# Overview
This will be a website called "Best Ball Rosters" which allows me to view my aggregated best ball rosters in a clean format, gather insights on the rosters, filter them, etc.

# Desired Features
1. Simple view of all rosters in a format that elegantly displays them. Keep in mind the fact that they're 20 players long.
  a. Use profile photos for players (links on the JSON)
  b. Use team-color/themed cards for players?
  c. This view can have filters by team, player, etc. so that only rosters matching the AND of the filters is returned.
    i. For example, a filter for Steelers + Joe Burrow would return all rosters with Joe Burrow + at least one Steelers player
2. Page that displays most common combos of N players/stacks
3. Page that ranks my rosters by the value on the roster compared to current ADP (in adp.json). The lower the total ADP on the roster, the better

# Technical specs
1. Use terraform and AWS for all infra
2. Use Typescript+React for the actual website
3. Make any other technical suggestions as needed
