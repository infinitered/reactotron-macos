import { View, ViewStyle, TextStyle, Text } from "react-native"

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

  return <View style={$middleContainer}>{!!title && <Text style={$title}>{title}</Text>}</View>
}

const $middleContainer: ViewStyle = {
  alignItems: "center",
  flex: 1,
  justifyContent: "center",
  paddingHorizontal: 10,
}

const $title: TextStyle = {
  color: "#333333",
  fontSize: 16,
  fontWeight: "500",
  textAlign: "center",
}
