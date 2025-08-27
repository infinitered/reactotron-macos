import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from "react-native"
import { useThemeName, themed } from "../theme/theme"

export type FilterType = "all" | "log" | "network"
export type LogLevel = "all" | "debug" | "warn" | "error"
export type SortBy = "time-newest" | "time-oldest" | "type" | "level"

export interface TimelineFilters {
  type: FilterType
  logLevel: LogLevel
  sortBy: SortBy
}

interface TimelineToolbarProps {
  filters: TimelineFilters
  onFiltersChange: (filters: TimelineFilters) => void
  itemCount: number
  filteredCount: number
}

export function TimelineToolbar({
  filters,
  onFiltersChange,
  itemCount,
  filteredCount,
}: TimelineToolbarProps) {
  const [themeName] = useThemeName()

  const updateFilter = (key: keyof TimelineFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <View style={$container(themeName)}>
      <View style={$content}>
        <FilterSection
          title="Type"
          options={[
            { key: "all", label: "All" },
            { key: "log", label: "Logs" },
            { key: "network", label: "Network" },
          ]}
          selected={filters.type}
          onSelect={(value) => updateFilter("type", value)}
        />

        <FilterSection
          title="Level"
          options={[
            { key: "all", label: "All" },
            { key: "debug", label: "Debug" },
            { key: "warn", label: "Warn" },
            { key: "error", label: "Error" },
          ]}
          selected={filters.logLevel}
          onSelect={(value) => updateFilter("logLevel", value)}
        />

        <FilterSection
          title="Sort"
          options={[
            { key: "time-newest", label: "↓ Newest" },
            { key: "time-oldest", label: "↑ Oldest" },
            { key: "type", label: "Type" },
            { key: "level", label: "Level" },
          ]}
          selected={filters.sortBy}
          onSelect={(value) => updateFilter("sortBy", value)}
        />

        <View style={$spacer} />

        <View style={$statsContainer}>
          <Text style={$statsText(themeName)}>
            {filteredCount === itemCount
              ? `${itemCount} items`
              : `${filteredCount} of ${itemCount}`}
          </Text>
        </View>
      </View>
    </View>
  )
}

interface FilterSectionProps {
  title: string
  options: Array<{ key: string; label: string }>
  selected: string
  onSelect: (key: string) => void
}

function FilterSection({ title, options, selected, onSelect }: FilterSectionProps) {
  return (
    <View style={$filterSection}>
      <Text style={$sectionTitle()}>{title}</Text>
      <View style={$buttonGroup}>
        {options.map((option) => (
          <FilterButton
            key={option.key}
            label={option.label}
            isSelected={selected === option.key}
            onPress={() => onSelect(option.key)}
          />
        ))}
      </View>
    </View>
  )
}

interface FilterButtonProps {
  label: string
  isSelected: boolean
  onPress: () => void
}

function FilterButton({ label, isSelected, onPress }: FilterButtonProps) {
  const [themeName] = useThemeName()

  return (
    <TouchableOpacity
      style={[$filterButton(themeName), isSelected && $filterButtonSelected(themeName)]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[$filterButtonText(themeName), isSelected && $filterButtonTextSelected(themeName)]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}

const $container = themed<ViewStyle>(({ colors, spacing }) => ({
  backgroundColor: colors.cardBackground,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
}))

const $content: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 20,
}

const $filterSection: ViewStyle = {
  flexDirection: "column",
  gap: 6,
}

const $sectionTitle = themed<TextStyle>(({ colors }) => ({
  fontSize: 11,
  fontWeight: "600",
  color: colors.neutral,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  marginBottom: 2,
}))

const $buttonGroup: ViewStyle = {
  flexDirection: "row",
  gap: 4,
}

const $spacer: ViewStyle = {
  flex: 1,
}

const $statsContainer: ViewStyle = {
  alignItems: "flex-end",
}

const $statsText = themed<TextStyle>(({ colors }) => ({
  fontSize: 11,
  color: colors.neutral,
  fontWeight: "500",
}))

const $filterButton = themed<ViewStyle>(({ colors, spacing }) => ({
  paddingHorizontal: spacing.xs,
  paddingVertical: 6,
  borderRadius: 6,
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.neutralVery,
  minWidth: 44,
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.03,
  shadowRadius: 1,
  elevation: 1,
}))

const $filterButtonSelected = themed<ViewStyle>(({ colors }) => ({
  backgroundColor: colors.primary,
  borderColor: colors.primary,
  shadowColor: colors.primary,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
}))

const $filterButtonText = themed<TextStyle>(({ colors }) => ({
  fontSize: 11,
  fontWeight: "500",
  color: colors.mainText,
}))

const $filterButtonTextSelected = themed<TextStyle>(({ colors }) => ({
  color: colors.background,
  fontWeight: "600",
}))
