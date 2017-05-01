import {PraxComponent, byPath} from 'prax'

export class Landing extends PraxComponent {
  subrender ({deref}) {
    return (
      <div className='padding-1'>
        <p>Welcome!</p>
        <p>Location: {deref(byPath(this.env.deref().nav, ['location', 'pathname']))}</p>
      </div>
    )
  }
}
