import { useState, useMemo } from 'react';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';
import { RosterList } from './components/roster/RosterList';
import { FilterPanel } from './components/filters/FilterPanel';
import { StacksList } from './components/stacks/StacksList';
import { StackFilter } from './components/stacks/StackFilter';
import { PlayerSearch } from './components/associations/PlayerSearch';
import { AssociationsList } from './components/associations/AssociationsList';
import { AssociationFilter } from './components/associations/AssociationFilter';
import { ExposuresList } from './components/exposure/ExposuresList';
import { ExposureFilter } from './components/exposure/ExposureFilter';
import { useRosters } from './hooks/useRosters';
import { useFilters } from './hooks/useFilters';
import { StacksService } from './services/StacksService';
import { PlayerAssociationsService } from './services/PlayerAssociationsService';
import { PlayerExposureService } from './services/PlayerExposureService';

function App() {
  const [activeTab, setActiveTab] = useState('rosters');
  const { rosters, loading } = useRosters();
  
  // Stacks page state
  const [stackMinSize, setStackMinSize] = useState<number | undefined>(undefined);
  const [stackMaxSize, setStackMaxSize] = useState<number | undefined>(undefined);
  const [stackSelectedTeams, setStackSelectedTeams] = useState<string[]>([]);
  const [stackSortBy, setStackSortBy] = useState<'frequency' | 'averageADP'>('frequency');
  const [stackSortDirection, setStackSortDirection] = useState<'asc' | 'desc'>('desc');

  // Player associations page state
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [associationSelectedTeams, setAssociationSelectedTeams] = useState<string[]>([]);
  const [associationSortBy, setAssociationSortBy] = useState<'frequency' | 'averageADP'>('frequency');
  const [associationSortDirection, setAssociationSortDirection] = useState<'asc' | 'desc'>('desc');

  // Player exposure page state
  const [exposureSelectedTeams, setExposureSelectedTeams] = useState<string[]>([]);
  const [exposurePlayerNameQuery, setExposurePlayerNameQuery] = useState<string>('');
  const [exposureSortBy, setExposureSortBy] = useState<'frequency' | 'averageADP'>('frequency');
  const [exposureSortDirection, setExposureSortDirection] = useState<'asc' | 'desc'>('desc');
  const {
    filteredRosters,
    filters,
    sort,
    availableFilterValues,
    hasActiveFilters,
    filterSummary,
    addTeamFilter,
    removeTeamFilter,
    addPlayerFilter,
    removePlayerFilter,
    addPositionFilter,
    removePositionFilter,
    setStackSizeFilter,
    setPositionCountFilter,
    clearPositionCountFilters,
    clearAllFilters,
    clearFilter,
    updateSort,
    searchPlayers
  } = useFilters(rosters);

  // Stack analysis
  const stacksService = StacksService.getInstance();
  const stackAnalysis = useMemo(() => {
    if (rosters.length === 0) return { stacks: [], totalRosters: 0 };
    return stacksService.analyzeStacks(rosters, 2, 20);
  }, [rosters, stacksService]);

  const availableStackSizes = useMemo(() => {
    return stacksService.getAvailableStackSizes(stackAnalysis);
  }, [stackAnalysis, stacksService]);

  const availableStackTeams = useMemo(() => {
    return stacksService.getAvailableTeams(stackAnalysis);
  }, [stackAnalysis, stacksService]);

  const filteredStacks = useMemo(() => {
    return stacksService.filterAndSortStacks(
      stackAnalysis,
      stackMinSize,
      stackMaxSize,
      stackSelectedTeams,
      stackSortBy,
      stackSortDirection
    );
  }, [stackAnalysis, stackMinSize, stackMaxSize, stackSelectedTeams, stackSortBy, stackSortDirection, stacksService]);

  // Player associations analysis
  const associationsService = PlayerAssociationsService.getInstance();
  const playerAssociationsAnalysis = useMemo(() => {
    if (rosters.length === 0 || !selectedPlayer) return null;
    const foundPlayer = associationsService.findPlayer(rosters, selectedPlayer);
    if (!foundPlayer) return null;
    return associationsService.analyzePlayerAssociations(rosters, foundPlayer);
  }, [rosters, selectedPlayer, associationsService]);

  const availableAssociationTeams = useMemo(() => {
    if (!playerAssociationsAnalysis) return [];
    return associationsService.getAvailableTeams(playerAssociationsAnalysis);
  }, [playerAssociationsAnalysis, associationsService]);

  const filteredAssociations = useMemo(() => {
    if (!playerAssociationsAnalysis) return [];
    return associationsService.filterAndSortAssociations(
      playerAssociationsAnalysis,
      associationSelectedTeams,
      associationSortBy,
      associationSortDirection
    );
  }, [playerAssociationsAnalysis, associationSelectedTeams, associationSortBy, associationSortDirection, associationsService]);

  // Player exposure analysis
  const exposureService = PlayerExposureService.getInstance();
  const playerExposureAnalysis = useMemo(() => {
    if (rosters.length === 0) return null;
    return exposureService.analyzePlayerExposure(rosters);
  }, [rosters, exposureService]);

  const availableExposureTeams = useMemo(() => {
    if (!playerExposureAnalysis) return [];
    return exposureService.getAvailableTeams(playerExposureAnalysis);
  }, [playerExposureAnalysis, exposureService]);

  const filteredExposures = useMemo(() => {
    if (!playerExposureAnalysis) return [];
    return exposureService.filterAndSortExposures(
      playerExposureAnalysis,
      exposureSelectedTeams,
      exposurePlayerNameQuery,
      exposureSortBy,
      exposureSortDirection
    );
  }, [playerExposureAnalysis, exposureSelectedTeams, exposurePlayerNameQuery, exposureSortBy, exposureSortDirection, exposureService]);

  const handleTeamToggle = (team: string) => {
    if (filters.teams.includes(team)) {
      removeTeamFilter(team);
    } else {
      addTeamFilter(team);
    }
  };

  const handlePositionToggle = (position: string) => {
    if (filters.positions.includes(position)) {
      removePositionFilter(position);
    } else {
      addPositionFilter(position);
    }
  };

  const handleStackSizeChange = (min?: number, max?: number) => {
    setStackMinSize(min);
    setStackMaxSize(max);
  };

  const handleStackTeamToggle = (team: string) => {
    if (stackSelectedTeams.includes(team)) {
      setStackSelectedTeams(prev => prev.filter(t => t !== team));
    } else {
      setStackSelectedTeams(prev => [...prev, team]);
    }
  };

  const clearStackTeams = () => {
    setStackSelectedTeams([]);
  };

  const clearStackFilters = () => {
    setStackMinSize(undefined);
    setStackMaxSize(undefined);
    setStackSelectedTeams([]);
  };

  const handleAssociationTeamToggle = (team: string) => {
    if (associationSelectedTeams.includes(team)) {
      setAssociationSelectedTeams(prev => prev.filter(t => t !== team));
    } else {
      setAssociationSelectedTeams(prev => [...prev, team]);
    }
  };

  const clearAssociationTeams = () => {
    setAssociationSelectedTeams([]);
  };

  const clearAssociationFilters = () => {
    setAssociationSelectedTeams([]);
  };

  const searchAssociationPlayers = (query: string) => {
    return associationsService.searchPlayers(rosters, query);
  };

  const handleExposureTeamToggle = (team: string) => {
    if (exposureSelectedTeams.includes(team)) {
      setExposureSelectedTeams(prev => prev.filter(t => t !== team));
    } else {
      setExposureSelectedTeams(prev => [...prev, team]);
    }
  };

  const clearExposureTeams = () => {
    setExposureSelectedTeams([]);
  };

  const clearExposureFilters = () => {
    setExposureSelectedTeams([]);
    setExposurePlayerNameQuery('');
  };

  const searchExposurePlayers = (query: string) => {
    if (!playerExposureAnalysis) return [];
    return exposureService.searchPlayers(playerExposureAnalysis, query);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'rosters':
        return (
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <FilterPanel
                filters={filters}
                sort={sort}
                availableFilterValues={availableFilterValues}
                onTeamToggle={handleTeamToggle}
                onPlayerAdd={addPlayerFilter}
                onPlayerRemove={removePlayerFilter}
                onStackSizeChange={setStackSizeFilter}
                onPositionCountChange={setPositionCountFilter}
                onClearPositionCounts={clearPositionCountFilters}
                onClearAllFilters={clearAllFilters}
                onClearTeams={() => clearFilter('teams')}
                onClearPlayers={() => clearFilter('players')}
                onSortChange={updateSort}
                onSearchPlayers={searchPlayers}
                hasActiveFilters={hasActiveFilters}
                filterSummary={filterSummary}
              />
            </div>
            <div className="lg:col-span-3">
              <RosterList 
                rosters={filteredRosters} 
                loading={loading.isLoading}
                error={loading.error}
              />
            </div>
          </div>
        );
      case 'stacks':
        return (
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <StackFilter
                minStackSize={stackMinSize}
                maxStackSize={stackMaxSize}
                availableStackSizes={availableStackSizes}
                selectedTeams={stackSelectedTeams}
                availableTeams={availableStackTeams}
                onStackSizeChange={handleStackSizeChange}
                onTeamToggle={handleStackTeamToggle}
                onClearTeams={clearStackTeams}
                sortBy={stackSortBy}
                sortDirection={stackSortDirection}
                onSortByChange={setStackSortBy}
                onSortDirectionChange={setStackSortDirection}
                onClear={clearStackFilters}
              />
            </div>
            <div className="lg:col-span-3">
              <StacksList
                stacks={filteredStacks}
                totalRosters={stackAnalysis.totalRosters}
                loading={loading.isLoading}
                error={loading.error}
              />
            </div>
          </div>
        );
      case 'associations':
        return (
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <PlayerSearch
                selectedPlayer={selectedPlayer}
                onPlayerSelect={setSelectedPlayer}
                onSearch={searchAssociationPlayers}
              />
              
              {playerAssociationsAnalysis && (
                <AssociationFilter
                  selectedTeams={associationSelectedTeams}
                  availableTeams={availableAssociationTeams}
                  onTeamToggle={handleAssociationTeamToggle}
                  onClearTeams={clearAssociationTeams}
                  sortBy={associationSortBy}
                  sortDirection={associationSortDirection}
                  onSortByChange={setAssociationSortBy}
                  onSortDirectionChange={setAssociationSortDirection}
                  onClear={clearAssociationFilters}
                />
              )}
            </div>
            <div className="lg:col-span-3">
              <AssociationsList
                analysis={playerAssociationsAnalysis}
                associations={filteredAssociations}
                loading={loading.isLoading}
                error={loading.error}
              />
            </div>
          </div>
        );
      case 'exposure':
        return (
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <ExposureFilter
                selectedTeams={exposureSelectedTeams}
                availableTeams={availableExposureTeams}
                onTeamToggle={handleExposureTeamToggle}
                onClearTeams={clearExposureTeams}
                playerNameQuery={exposurePlayerNameQuery}
                onPlayerNameChange={setExposurePlayerNameQuery}
                onSearchPlayers={searchExposurePlayers}
                sortBy={exposureSortBy}
                sortDirection={exposureSortDirection}
                onSortByChange={setExposureSortBy}
                onSortDirectionChange={setExposureSortDirection}
                onClear={clearExposureFilters}
              />
            </div>
            <div className="lg:col-span-3">
              <ExposuresList
                analysis={playerExposureAnalysis}
                exposures={filteredExposures}
                loading={loading.isLoading}
                error={loading.error}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
