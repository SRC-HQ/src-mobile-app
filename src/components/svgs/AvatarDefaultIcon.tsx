import * as React from 'react'
import Svg, { G, Circle, Ellipse, Path } from 'react-native-svg'

interface AvatarDefaultIconProps {
  width?: number
  height?: number
  [key: string]: any
}

const AvatarDefaultIcon = ({ width = 40, height = 40, ...props }: AvatarDefaultIconProps) => (
  <Svg width={width} height={height} viewBox="0 0 471.98 471.98" {...props}>
    <G id="Layer_2" data-name="Layer 2">
      <G id="Layer_1-2" data-name="Layer 1">
        <Circle cx={235.99} cy={235.99} r={235.99} fill="#5b5880" />
        <Ellipse cx={235.99} cy={230.9} rx={56.16} ry={95.04} fill="#fff" />
        <Path
          d="M223.5,117.15h0c-8.88-6.77-13.67-20.81-9.81-34.24l4.08-14.19L223.16,50c3.7-12.89,22-12.89,25.67,0l5.39,18.76,4.07,14.19c3.86,13.43-.93,27.47-9.8,34.24h0A20.57,20.57,0,0,1,223.5,117.15Z"
          fill="#fff"
        />
        <Path
          d="M236,220.18c-49.61,0-89.79,36.21-89.79,80.83S186.44,431.7,236,431.7,325.78,345.75,325.78,301,285.61,220.18,236,220.18ZM197.8,388c-10.35,0-18.75-11.38-18.75-25.43s8.4-25.43,18.75-25.43,18.75,11.38,18.75,25.43S208.15,388,197.8,388Zm76.38,0c-10.35,0-18.74-11.38-18.74-25.43s8.39-25.43,18.74-25.43,18.75,11.38,18.75,25.43S284.54,388,274.18,388Z"
          fill="#fff"
        />
      </G>
    </G>
  </Svg>
)

export default AvatarDefaultIcon
