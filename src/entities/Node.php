<?php

namespace SeArch\Entities;

/**
 * @Entity(repositoryClass="SeArch\Entities\Repositories\NodeRepository")
 * @Table(name="nodes")
 */
class Node extends \MyApp\Entities\Node {

	/**
	 * @OneToMany(targetEntity="MyApp\Entities\Relation", mappedBy="startNode", cascade={"all"})
	 **/
	protected $relations = [];

}
