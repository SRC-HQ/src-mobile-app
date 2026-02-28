import * as React from 'react'
import Svg, { Path, SvgProps } from 'react-native-svg'

const LeaderboardIconSvg = (props: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M7 17h2v-7H7v7zm4 0h2V7h-2v10zm4 0h2v-4h-2v4zM5 21h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2z"
      fill="currentColor"
    />
  </Svg>
)

export default LeaderboardIconSvg
