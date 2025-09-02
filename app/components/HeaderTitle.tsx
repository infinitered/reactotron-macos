import { View, ViewStyle, TextStyle, Text } from "react-native"
import { themed } from "../theme/theme"

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

  return <View style={$inner()}>{!!title && <Text style={$title()}>{title}</Text>}</View>
}

const $inner = themed<ViewStyle>(() => ({
  alignItems: "center",
  flex: 1,
  justifyContent: "center",
  paddingHorizontal: 10,
}))

const $title = themed<TextStyle>(({ typography, colors }) => ({
  color: colors.mainText,
  fontSize: typography.body,
  fontWeight: "500",
  textAlign: "center",
}))
