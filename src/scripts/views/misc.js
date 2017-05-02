import {PraxComponent} from 'prax'
import {Link} from './link'

export function Page404 () {
  return (
    <div className='col-center-center'>
      <h1 className='font-6'>404</h1>
      <p className='font-4'>Page Not Found</p>
      <Link to='/' className='font-4'>Back to Home</Link>
    </div>
  )
}

export function Button ({children, ...props}) {
  return (
    <button type='button' {...props}>
      <span className='row-center-center'>
        {children}
      </span>
    </button>
  )
}

export class ErrorPanels extends PraxComponent {
  subrender () {
    const {props: {errors}} = this

    return _.isEmpty(errors) ? null : (
      <div className='children-margin-0x5-v'>
        {_.map(errors, (error, index) => (
          <p className='col-start-stretch panel-red padding-0x5' key={index}>
            <span>{error.message || error}</span>
          </p>
        ))}
      </div>
    )
  }
}
