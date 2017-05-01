import {Router, Route, Switch} from 'react-router-dom'
import {PraxComponent} from 'prax'
import {journal} from '../utils'
import {
  Page404,
  Header,
  Footer,
  Chat,
  Profile,
} from './'

export class Root extends PraxComponent {
  subrender () {
    return (
      <Router history={journal}>
        <div className='page-width viewport-size'>
          <Header />
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
