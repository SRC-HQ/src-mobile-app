import * as React from 'react'
import Svg, { G, Path } from 'react-native-svg'

interface MatchesIconSvgProps {
  width?: number
  height?: number
  color?: string
  [key: string]: any
}

const MatchesIconSvg = ({ width = 20, height = 20, color = '#fff', ...props }: MatchesIconSvgProps) => (
  <Svg width={width} height={height} viewBox="0 0 624.07 469" {...props}>
    <G>
      <Path
        fill={color}
        d="M82.25,262.7C36.8,262.7,0,298,0,341.44s36.86,127.3,82.25,127.3,82.26-83.71,82.26-127.3S127.71,262.7,82.25,262.7Zm-35,163.51c-9.49,0-17.18-11.09-17.18-24.78s7.69-24.77,17.18-24.77,17.17,11.09,17.17,24.77S56.75,426.21,47.27,426.21Zm70,0c-9.48,0-17.17-11.09-17.17-24.78s7.69-24.77,17.17-24.77,17.17,11.09,17.17,24.77S126.73,426.21,117.24,426.21Z"
      />
      <Path
        fill={color}
        d="M82.26,300.2a37.49,37.49,0,0,1-37.5-37.5V37.5a37.5,37.5,0,0,1,75,0V262.7A37.5,37.5,0,0,1,82.26,300.2Z"
      />
      <Path fill={color} d="M592.57,63.05H186.36a31.5,31.5,0,0,1,0-63H592.57a31.5,31.5,0,1,1,0,63Z" />
      <Path fill={color} d="M592.57,266H217.45a31.5,31.5,0,0,1,0-63H592.57a31.5,31.5,0,1,1,0,63Z" />
      <Path fill={color} d="M592.57,469H243.38a31.5,31.5,0,0,1,0-63H592.57a31.5,31.5,0,1,1,0,63Z" />
    </G>
  </Svg>
)

export default MatchesIconSvg
