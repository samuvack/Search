<?php

$config = require __DIR__ .'/config/main.php';
require_once __DIR__ . '/../vendor/autoload.php';
require_once $config['wiki_dir'].'/vendor/autoload.php';


use Doctrine\DBAL\Types\Type;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Console\Question\ConfirmationQuestion;
use Knp\Provider\ConsoleServiceProvider;
use Silex\Provider\DoctrineServiceProvider;

use Dflydev\Silex\Provider\DoctrineOrm\DoctrineOrmServiceProvider;
use Jsor\Doctrine\PostGIS\Event\ORMSchemaEventSubscriber;

use Silex\Provider;

Class Application extends Silex\Application {
	use \Silex\Application\TwigTrait;
	use \Silex\Application\FormTrait;
	use \Silex\Application\SecurityTrait;
	use \Silex\Application\UrlGeneratorTrait;
}

$app = new Application();
$app['debug'] = APP_DEBUG;

$app->register(new ConsoleServiceProvider(), array(
	'console.name' => 'temporary',
	'console.version' => 1,
	'console.project_directory' => __DIR__ . '/..'
));
$app->register(new \Silex\Provider\TwigServiceProvider(), array('twig.path' => __DIR__ . '/../views'));
$app['twig.loader.filesystem']->addPath($config['wiki_dir'] .'/views/values', 'values');


// Import Database config, and start Doctrine service
$dbconfig = include $config['wiki_dir']. "/app/config/db.include.php";
$dbconfig["driver"] = 'pdo_pgsql';
$app->register(new DoctrineServiceProvider, array(
	"db.options" => $dbconfig
));

$app->register(new DoctrineOrmServiceProvider, array(
	"orm.em.options" => array(
		"mappings" => array(
			array(
				"type" => "annotation",
				"namespace" => "SeArch\Entities",
				"path" => __DIR__ . "/../src/entities/",
				"alias" => ""
			),
			array(
				"type" => "annotation",
				"namespace" => "MyApp\Entities",
				"path" => $config['wiki_dir']."/src/entities/",
				"alias" => "app"
			)
		),
	),
	// Postgis functions
	"orm.custom.functions.string" => array(
		"ST_Intersects" => "Jsor\Doctrine\PostGIS\Functions\ST_Intersects",
		"ST_Transform" => "Jsor\Doctrine\PostGIS\Functions\ST_Transform",
		"ST_Buffer" => "Jsor\Doctrine\PostGIS\Functions\ST_Buffer",
		"ST_SetSRID" => "Jsor\Doctrine\PostGIS\Functions\ST_SetSRID",
		"ST_Point" => "Jsor\Doctrine\PostGIS\Functions\ST_Point",
		'ST_Distance' => 'Jsor\Doctrine\PostGIS\Functions\ST_Distance'
	),
	'orm.auto_generate_proxies' => $app['debug']
));

$app['orm.em']->getEventManager()->addEventSubscriber(new ORMSchemaEventSubscriber());

$app->match('/', function(Application $app) {
	$em = $app['orm.em'];
	$layerRepository = $em->getRepository(':Layer');
	$layers = $layerRepository->findBy(array(),array('order_draw'=>'ASC'));
	$groupRepository = $em->getRepository(':Group');
	$groups = $groupRepository->findBy(array(),array('order_legend'=>'ASC'));
	return $app['twig']->render('home.twig', array('layers'=>$layers, "groups"=> $groups));
});

$app->match('ajax/featureinfo', function(Application $app) {
	$tempLayers = $app['orm.em']->getRepository(':Layer')->findBy(array());
	$layers = [];
	foreach($tempLayers as $layer) {
		if($layer->hasFeatureInfo() && (isset($_GET['l'.$layer->getId()]))   =='true') { //isset toegevoegd na foutmelding
			$layers[$layer->getLegendName()] =
				$app['orm.em']->getRepository(':Node')->findInCircle($layer, $_GET['x'], $_GET['y'], $_GET['res']);
		}
	}

	return $app['twig']->render('object.twig', array('layers'=>$layers));
});

$app->match('ajax/closest', function(Application $app) {
	$layers = array_filter(
		$app['orm.em']->getRepository(':Layer')->findBy(array()),
		function($layer) {
			return $layer->hasFeatureInfo() && (isset($_GET['l'.$layer->getId()]))  =='true';
		}
	);

	$node = $app['orm.em']->getRepository(':Node')->findClosest($layers, $_GET['x'], $_GET['y'], $_GET['res']);
	if(empty($node)) {
		throw $this->createNotFoundException('No node nearby.');
	}
	return $app->json($node[0]->getId());
});
include $config['wiki_dir'] .'/app/common_app.php';

return $app;
