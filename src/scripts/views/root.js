import {Router, Route, Switch} from 'react-router-dom'
import {PraxComponent, byPath} from 'prax'
import {journal} from '../utils'
import {
  Page404,
  Header,
  Footer,
  Chat,
  Profile,
  ErrorPanels,
} from './'

export class Root extends PraxComponent {
  subrender ({deref}) {
    const authError = deref(byPath(this.env.deref().auth, ['error']))

    return (
      <Router history={journal}>
        <div className='page-width viewport-size'>
          <Header />
          {authError ?
          <div className='padding-1-h'>
            <ErrorPanels errors={[authError]} />
          </div> : null}
          <div className='flex-1 col-start-stretch'>
            <Switch>
              <Route exact path='/'              component={Chat} />
              <Route path='/profile'             component={Profile} />
              <Route                             component={Page404} />
            </Switch>
          </div>
          <Footer />
        </div>
      </Router>
    )
  }
}
