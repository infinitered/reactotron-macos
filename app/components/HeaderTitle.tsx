import { View, ViewStyle, TextStyle, Text } from "react-native"
import { useThemeName, withTheme } from "../theme/theme"

export interface HeaderTitleProps {
  title: string
}

/**
 * A header title component. Use inside of <Header>.
 *
 * @example
 * <Header>
 *   <HeaderTitle title="Title" />
 * </Header>
 */
export function HeaderTitle(props: HeaderTitleProps) {
  const { title } = props
  const [theme] = useThemeName()

  return (
    <View style={$middleContainer(theme)}>
      {!!title && <Text style={$title(theme)}>{title}</Text>}
    </View>
  )
}

const $middleContainer = withTheme<ViewStyle>(() => ({
  alignItems: "center",
  flex: 1,
  justifyContent: "center",
  paddingHorizontal: 10,
}))

const $title = withTheme<TextStyle>(({ typography, colors }) => ({
  color: colors.mainText,
  fontSize: typography.body,
  fontWeight: "500",
  textAlign: "center",
}))
