import {PraxComponent} from 'prax'
import {mix} from '../utils'

export class LoadingIndicator extends PraxComponent {
  subrender () {
    const {props} = this
    return (
      <span {...mix({className: 'row-center-center popping-3 children-margin-popping'}, props)}>
        <span className='popping'>●</span>
        <span className='popping'>●</span>
        <span className='popping'>●</span>
      </span>
    )
  }
}
